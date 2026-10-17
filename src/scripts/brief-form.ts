// Client side of /start-a-project: steps, conditional questions, autosave,
// uploads to R2, the domain check and the live estimate. The page renders every
// question up front; this only shows, hides and animates them.
import {
  estimate,
  formatMoney,
  suggestDomains,
  cleanDomain,
  DOMAIN_RE,
  type BriefAnswers,
  type Currency,
  type SiteType,
} from '../data/brief';

const STORE = 'brief:v1';
const STALE_AFTER = 30 * 24 * 60 * 60 * 1000; // forget a half-filled brief after 30 days

type Kind = 'brand' | 'photos';
interface Upload {
  key: string;
  name: string;
  size: number;
  kind: Kind;
  type: string;
}
interface Saved {
  id: string;
  step: number;
  values: Record<string, string | string[]>;
  currency?: Currency;
  currencyPinned?: boolean;
  uploads: Upload[];
  savedAt: number;
}

type DomainStatus = 'available' | 'taken' | 'unknown';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Restart a one-shot CSS animation class on an element. */
function animate(el: Element, cls: string) {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  const done = (e: Event) => {
    if (e.target !== el) return; // ignore animations bubbling up from children
    el.classList.remove(cls);
    el.removeEventListener('animationend', done);
  };
  el.addEventListener('animationend', done);
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    return Date.now() - saved.savedAt < STALE_AFTER ? saved : null;
  } catch {
    return null;
  }
}

export function initBriefForm() {
  const found = $<HTMLFormElement>('#brief-form');
  if (!found) return;
  const form: HTMLFormElement = found; // non-null inside the closures below

  const steps = $$<HTMLFieldSetElement>('fieldset[data-step]', form);
  const total = steps.length;
  const progressFill = $('.progress-fill')!;
  const progressLabel = $('[data-progress-label]')!;
  const progressTitle = $('[data-progress-title]')!;
  const backBtn = $<HTMLButtonElement>('[data-back]', form)!;
  const nextBtn = $<HTMLButtonElement>('[data-next]', form)!;
  const submitBtn = $<HTMLButtonElement>('[data-submit]', form)!;
  const status = $('[data-form-status]', form)!;

  const fresh = (): Saved => ({ id: crypto.randomUUID(), step: 1, values: {}, uploads: [], savedAt: Date.now() });
  const restored = load();
  const state: Saved = restored ?? fresh();
  let step = Math.min(Math.max(state.step || 1, 1), total);

  // ── Persistence ──────────────────────────────────────────────────────────
  function readValues() {
    const values: Saved['values'] = {};
    for (const el of $$<HTMLInputElement | HTMLTextAreaElement>('input[name], textarea[name]', form)) {
      if (el.name === 'website_url' || el.type === 'file') continue;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        if (el.checked) values[el.name] = el.value;
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        const list = (values[el.name] as string[] | undefined) ?? [];
        if (el.checked) list.push(el.value);
        values[el.name] = list;
      } else {
        values[el.name] = el.value;
      }
    }
    return values;
  }

  function writeValues(values: Saved['values']) {
    for (const el of $$<HTMLInputElement | HTMLTextAreaElement>('input[name], textarea[name]', form)) {
      const v = values[el.name];
      if (v === undefined) continue;
      if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) {
        el.checked = Array.isArray(v) ? v.includes(el.value) : v === el.value;
      } else if (typeof v === 'string') {
        el.value = v;
      }
    }
  }

  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      state.values = readValues();
      state.step = step;
      state.savedAt = Date.now();
      try {
        localStorage.setItem(STORE, JSON.stringify(state));
      } catch {
        /* private mode / storage full — the form still works, it just won't resume */
      }
    }, 250);
  }

  // ── Reading answers ──────────────────────────────────────────────────────
  const radio = (name: string) => $<HTMLInputElement>(`input[name="${name}"]:checked`, form)?.value ?? '';
  const text = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? '';

  function answers(): BriefAnswers {
    const fd = new FormData(form); // disabled (hidden) questions are left out
    const get = (k: string) => String(fd.get(k) ?? '').trim();
    const type = (get('type') || 'other') as SiteType;
    return {
      name: get('name'),
      whatsapp: get('whatsapp'),
      email: get('email'),
      org: get('org'),
      type,
      stage: get('stage'),
      currentUrl: get('currentUrl'),
      goals: fd.getAll(`goals-${type}`).map(String),
      extras: fd.getAll('extras').map(String),
      products: get('products'),
      branding: get('branding'),
      photos: get('photos'),
      photosLater: get('photosLater') === 'yes',
      copy: get('copy'),
      inspiration: get('inspiration'),
      hasDomain: get('hasDomain'),
      domain: cleanDomain(get('domainOwned') || get('domainWanted')),
      businessEmail: get('businessEmail'),
      retainer: get('retainer'),
      budgetFit: get('budgetFit'),
      budgetNote: get('budgetNote'),
      timeline: get('timeline'),
      deadline: get('deadline'),
      notes: get('notes'),
      currency: state.currency ?? 'NGN',
    };
  }

  // ── Conditional questions ────────────────────────────────────────────────
  // `data-when="field=a,b"` shows a block only while that field is a or b.
  // Hidden blocks also disable their inputs, so they skip validation and are
  // left out of the submission.
  function applyConditions(animateIn = true) {
    for (const el of $$('[data-when]', form)) {
      const [field, list] = el.dataset.when!.split('=');
      const current = radio(field) || text(field);
      const show = list.split(',').includes(current);
      if (show && el.hidden) {
        el.hidden = false;
        if (animateIn) animate(el, 'is-entering');
      } else if (!show && !el.hidden) {
        el.hidden = true;
      }
    }
    for (const input of $$<HTMLInputElement | HTMLTextAreaElement>('input, textarea', form)) {
      input.disabled = !!input.closest('[data-when][hidden]');
    }
    const domain = cleanDomain(text('domainOwned') || text('domainWanted') || text('currentUrl'));
    $('[data-email-example]', form)!.textContent = `info@${DOMAIN_RE.test(domain) ? domain : 'yourname.com'}`;
    $('[data-echo="currentUrl"]', form)!.textContent = cleanDomain(text('currentUrl'));
    $('[data-copy-via]', form)!.textContent = text('email') ? 'by email' : 'on WhatsApp';
  }

  // ── Steps ────────────────────────────────────────────────────────────────
  function render(dir: 'fwd' | 'back' | 'none') {
    steps.forEach((s, i) => {
      const active = i + 1 === step;
      if (active && s.hidden) {
        s.hidden = false;
        if (dir !== 'none') animate(s, dir === 'fwd' ? 'step-in-fwd' : 'step-in-back');
      } else if (!active) {
        s.hidden = true;
      }
    });
    progressFill.style.width = `${(step / total) * 100}%`;
    progressLabel.textContent = `Step ${step} of ${total}`;
    progressTitle.textContent = steps[step - 1].querySelector('legend')?.textContent ?? '';
    backBtn.hidden = step === 1;
    nextBtn.hidden = step === total;
    submitBtn.hidden = step !== total;
    hideStatus();

    if (step === 5) renderDomainSuggestions();
    if (step === 6) renderEstimate();
  }

  function go(to: number) {
    const dir = to > step ? 'fwd' : 'back';
    step = to;
    render(dir);
    save();
    const top = $('#brief-progress')!;
    if (top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function showStatus(msg: string, tone: 'error' | 'info' = 'error') {
    status.textContent = msg;
    status.className = `mt-3 text-sm ${tone === 'error' ? 'text-red-400' : 'text-muted'}`;
  }
  function hideStatus() {
    status.className = 'mt-3 hidden text-sm';
  }

  function validateStep(): boolean {
    const current = steps[step - 1];
    $$('.invalid', current).forEach((el) => el.classList.remove('invalid'));
    $$('[aria-invalid]', current).forEach((el) => el.removeAttribute('aria-invalid'));

    const bad: HTMLElement[] = [];
    for (const f of $$<HTMLInputElement | HTMLTextAreaElement>('input:not(:disabled), textarea:not(:disabled)', current)) {
      if (f.name === 'website_url' || f.type === 'file') continue;
      if (f.name === 'whatsapp' && f.value.replace(/\D/g, '').length < 7) f.setCustomValidity('Enter a WhatsApp number');
      else if (f.name === 'whatsapp') f.setCustomValidity('');
      if (f.checkValidity()) continue;
      if (f instanceof HTMLInputElement && (f.type === 'radio' || f.type === 'checkbox')) {
        $$<HTMLInputElement>(`input[name="${f.name}"]`, current).forEach((r) => r.closest('.choice')?.classList.add('invalid'));
      } else {
        f.setAttribute('aria-invalid', 'true');
      }
      bad.push(f);
    }

    // At least one goal in the visible goals group.
    const goals = $('[data-goals]:not([hidden])', current);
    if (goals && !$('input:checked', goals)) {
      $$('.choice', goals).forEach((c) => c.classList.add('invalid'));
      bad.push($<HTMLInputElement>('input', goals)!);
    }

    if (!bad.length) return true;
    showStatus('Please answer the highlighted question' + (bad.length > 1 ? 's' : '') + '.');
    animate(current, 'shake');
    const first = bad[0];
    first.closest('.choice, div')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    if (!(first instanceof HTMLInputElement && (first.type === 'radio' || first.type === 'checkbox'))) {
      first.focus({ preventScroll: true });
    }
    return false;
  }

  backBtn.addEventListener('click', () => go(step - 1));
  nextBtn.addEventListener('click', () => {
    if (validateStep()) go(step + 1);
  });

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    t.removeAttribute('aria-invalid');
    t.closest('[role="radiogroup"], [data-goals]')?.querySelectorAll('.invalid').forEach((c) => c.classList.remove('invalid'));
    applyConditions();
    if (step === 6) renderEstimate();
    save();
  });

  // Choice cards get a small "pop" when picked.
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if ((t.type === 'radio' || t.type === 'checkbox') && t.checked) {
      const card = t.closest('.choice');
      if (card) animate(card, 'pop');
    }
    if (t.name === 'hasDomain') renderDomainSuggestions();
  });

  // ── Domain suggestions & availability ────────────────────────────────────
  const domainCache = new Map<string, Promise<DomainStatus>>();
  function checkDomain(d: string): Promise<DomainStatus> {
    if (!domainCache.has(d)) {
      domainCache.set(
        d,
        fetch(`/api/domain?name=${encodeURIComponent(d)}`)
          .then((r) => (r.ok ? r.json() : { status: 'unknown' }))
          .then((j: { status: DomainStatus }) => j.status)
          .catch(() => 'unknown' as const),
      );
    }
    return domainCache.get(d)!;
  }

  const wanted = $<HTMLInputElement>('#b-domain-wanted')!;
  const domainStatus = $('[data-domain-status]')!;
  const STATUS_COPY: Record<DomainStatus | 'checking', [string, string]> = {
    checking: ['Checking…', 'text-muted'],
    available: ['✓ Looks available', 'text-accent'],
    taken: ['✗ This one is taken — no problem, Daniel will reach out with alternatives.', 'text-amber-400'],
    unknown: ['We’ll confirm this one for you.', 'text-muted'],
  };

  function setDomainStatus(s: DomainStatus | 'checking' | null) {
    if (!s) {
      domainStatus.className = 'mt-2 hidden text-sm';
      return;
    }
    const [copy, cls] = STATUS_COPY[s];
    domainStatus.textContent = copy;
    domainStatus.className = `mt-2 text-sm ${cls}`;
    if (s !== 'checking') animate(domainStatus, 'is-entering');
  }

  let domainTimer = 0;
  function checkWanted() {
    clearTimeout(domainTimer);
    const d = cleanDomain(wanted.value);
    if (!DOMAIN_RE.test(d)) return setDomainStatus(null);
    setDomainStatus('checking');
    domainTimer = window.setTimeout(async () => {
      const s = await checkDomain(d);
      if (cleanDomain(wanted.value) === d) setDomainStatus(s);
    }, 500);
  }
  wanted.addEventListener('input', checkWanted);

  function renderDomainSuggestions() {
    const box = $('[data-domain-suggestions]', form)!;
    const list = suggestDomains(text('org'), radio('type'));
    if (box.dataset.for === list.join()) return;
    box.dataset.for = list.join();
    box.replaceChildren(
      ...list.map((d, i) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'domain-chip is-entering';
        chip.style.setProperty('--i', String(i));
        chip.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="font-mono"></span>`;
        chip.lastElementChild!.textContent = d;
        chip.addEventListener('click', () => {
          wanted.value = d;
          wanted.dispatchEvent(new Event('input', { bubbles: true }));
          checkWanted();
        });
        checkDomain(d).then((s) => {
          chip.dataset.status = s;
          chip.title = s === 'available' ? 'Looks available' : s === 'taken' ? 'Taken' : '';
        });
        return chip;
      }),
    );
    if (wanted.value) checkWanted();
  }

  // ── Estimate ─────────────────────────────────────────────────────────────
  const rangeEl = $('[data-estimate-range]', form)!;
  const linesEl = $('[data-estimate-lines]', form)!;
  const shown = { min: 0, max: 0, currency: '' as string };
  let tween = 0;

  function renderEstimate() {
    const cur = state.currency ?? 'NGN';
    const est = estimate(answers(), cur);
    $$<HTMLButtonElement>('[data-currency]', form).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.currency === cur)));

    linesEl.replaceChildren(
      ...est.lines.map((l) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between gap-4 py-1.5 text-muted';
        const a = document.createElement('span');
        a.textContent = l.label;
        const b = document.createElement('span');
        b.className = 'shrink-0 font-mono text-xs text-main';
        b.textContent = `${formatMoney(l.min, cur)} – ${formatMoney(l.max, cur)}`;
        li.append(a, b);
        return li;
      }),
    );

    // Count up/down from what's on screen — skipped on a currency switch,
    // where the numbers aren't comparable anyway.
    cancelAnimationFrame(tween);
    const from = shown.currency === cur ? { ...shown } : { min: est.min, max: est.max };
    const paint = (min: number, max: number) => {
      const round = cur === 'NGN' ? 5000 : 5;
      rangeEl.textContent = `${formatMoney(Math.round(min / round) * round, cur)} – ${formatMoney(Math.round(max / round) * round, cur)}`;
    };
    if (reducedMotion() || (from.min === est.min && from.max === est.max)) {
      paint(est.min, est.max);
    } else {
      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.min((now - start) / 600, 1);
        const k = 1 - Math.pow(1 - t, 3);
        paint(from.min + (est.min - from.min) * k, from.max + (est.max - from.max) * k);
        if (t < 1) tween = requestAnimationFrame(frame);
      };
      tween = requestAnimationFrame(frame);
    }
    if (shown.currency !== cur) animate(rangeEl, 'is-entering');
    Object.assign(shown, { min: est.min, max: est.max, currency: cur });
  }

  $$<HTMLButtonElement>('[data-currency]', form).forEach((b) =>
    b.addEventListener('click', () => {
      state.currency = b.dataset.currency as Currency;
      state.currencyPinned = true;
      renderEstimate();
      save();
    }),
  );

  // Naira for visitors in Nigeria, dollars elsewhere. The timezone is an
  // instant first guess; Cloudflare's country lookup confirms it. A manual
  // switch always wins.
  if (!state.currencyPinned) {
    state.currency ??= Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Lagos' ? 'NGN' : 'USD';
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { currency?: Currency } | null) => {
        if (j?.currency && !state.currencyPinned) {
          state.currency = j.currency;
          if (step === 6) renderEstimate();
        }
      })
      .catch(() => {});
  }

  // ── Uploads ──────────────────────────────────────────────────────────────
  const fileUrl = (key: string) => `/files/${key.replace(/^briefs\//, '')}`;

  async function shrink(file: File): Promise<Blob> {
    // Phone photos are often 4–12 MB; 2400px JPEG is plenty for the web and
    // uploads in seconds on mobile data.
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1_500_000) return file;
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
      return blob && blob.size < file.size ? blob : file;
    } catch {
      return file;
    }
  }

  function send(blob: Blob, name: string, kind: Kind, onProgress: (p: number) => void): Promise<Upload> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const qs = new URLSearchParams({ id: state.id, kind, name });
      xhr.open('POST', `/api/upload?${qs}`);
      xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const j = JSON.parse(xhr.responseText) as { key: string };
          resolve({ key: j.key, name, size: blob.size, kind, type: blob.type });
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(blob);
    });
  }

  for (const zone of $$('[data-upload]', form)) {
    const kind = zone.dataset.upload as Kind;
    const max = Number(zone.dataset.max);
    const pick = document.createElement('label');
    pick.className = 'dropzone mt-3';
    pick.innerHTML = `
      <input type="file" multiple class="sr-only" accept="${zone.dataset.accept}" />
      <span class="dropzone-icon" aria-hidden="true">＋</span>
      <span><span class="font-medium text-main">Choose files</span><span class="hidden sm:inline"> or drag them here</span></span>`;
    const grid = document.createElement('ul');
    grid.className = 'thumbs';
    grid.setAttribute('role', 'list');
    zone.append(pick, grid);
    const input = pick.querySelector('input')!;

    const tile = (name: string, type: string, src?: string) => {
      const li = document.createElement('li');
      li.className = 'thumb is-entering';
      li.innerHTML = `
        <div class="thumb-media"></div>
        <div class="thumb-bar"><span></span></div>
        <button type="button" class="thumb-remove" aria-label="Remove">×</button>`;
      const media = li.querySelector('.thumb-media')!;
      if (src && type.startsWith('image/') && type !== 'image/heic' && type !== 'image/heif') {
        const img = document.createElement('img');
        img.src = src;
        img.alt = name;
        img.loading = 'lazy';
        media.append(img);
      } else {
        media.innerHTML = `<span class="thumb-file">${type === 'application/pdf' ? 'PDF' : 'FILE'}</span>`;
      }
      li.title = name;
      grid.append(li);
      return li;
    };

    const wireRemove = (li: HTMLLIElement, up: Upload) => {
      li.querySelector('.thumb-remove')!.addEventListener('click', () => {
        li.classList.add('is-leaving');
        state.uploads = state.uploads.filter((u) => u.key !== up.key);
        save();
        fetch(`/api/upload?key=${encodeURIComponent(up.key)}`, { method: 'DELETE' }).catch(() => {});
        setTimeout(() => li.remove(), reducedMotion() ? 0 : 200);
      });
    };

    // Uploads from an earlier visit.
    for (const up of state.uploads.filter((u) => u.kind === kind)) {
      const li = tile(up.name, up.type, fileUrl(up.key));
      li.classList.add('is-done');
      wireRemove(li, up);
    }

    const handle = async (files: FileList | File[]) => {
      for (const file of [...files]) {
        const count = state.uploads.filter((u) => u.kind === kind).length + grid.querySelectorAll('.is-uploading').length;
        if (count >= max) {
          showStatus(`That’s the limit of ${max} files here — send any extras on WhatsApp.`, 'info');
          break;
        }
        const preview = URL.createObjectURL(file);
        const li = tile(file.name, file.type, preview);
        li.classList.add('is-uploading');
        const bar = li.querySelector<HTMLElement>('.thumb-bar span')!;
        try {
          const blob = kind === 'photos' ? await shrink(file) : file;
          const up = await send(blob, file.name, kind, (p) => (bar.style.width = `${Math.round(p * 100)}%`));
          state.uploads.push(up);
          save();
          li.classList.replace('is-uploading', 'is-done');
          wireRemove(li, up);
        } catch {
          li.classList.replace('is-uploading', 'is-failed');
          li.title = `${file.name} — couldn’t upload. Remove it and try again.`;
          li.querySelector('.thumb-remove')!.addEventListener('click', () => li.remove());
        }
      }
    };

    input.addEventListener('change', () => {
      if (input.files) handle(input.files);
      input.value = '';
    });
    pick.addEventListener('dragover', (e) => {
      e.preventDefault();
      pick.classList.add('is-over');
    });
    pick.addEventListener('dragleave', () => pick.classList.remove('is-over'));
    pick.addEventListener('drop', (e) => {
      e.preventDefault();
      pick.classList.remove('is-over');
      if (e.dataTransfer?.files) handle(e.dataTransfer.files);
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (step < total) return go(step + 1); // Enter key on an earlier step

    if ($$('.is-uploading', form).length) {
      showStatus('Hold on — your files are still uploading.', 'info');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-busy');
    showStatus('Sending…', 'info');
    const a = answers();
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.id, answers: a, website_url: text('website_url') }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        notified?: boolean;
        clientEmailed?: boolean;
        backup?: { subject: string; text: string };
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error || 'Request failed');

      // The brief is saved either way; this only makes sure Daniel hears about it.
      let notified = j.notified !== false;
      const key = form.dataset.backupKey;
      if (!notified && j.backup && key) {
        const fd = new FormData();
        fd.append('access_key', key);
        fd.append('subject', j.backup.subject);
        fd.append('from_name', 'Start a project');
        fd.append('message', j.backup.text);
        if (a.email) fd.append('email', a.email);
        notified = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
          .then((r) => r.ok)
          .catch(() => false);
      }

      try {
        localStorage.removeItem(STORE);
      } catch {}
      const done = $('#brief-done')!;
      // Only promise an email copy if one actually went out.
      const emailed = !!a.email && j.clientEmailed === true;
      $('[data-done-email]', done)!.textContent = a.email;
      $('[data-done-has-email]', done)!.hidden = !emailed;
      $('[data-done-no-email]', done)!.hidden = emailed;
      $('[data-done-warn]', done)!.hidden = notified;
      form.hidden = true;
      $('#brief-progress')!.hidden = true;
      $('[data-welcome]')?.setAttribute('hidden', '');
      done.hidden = false;
      done.classList.add('done-in'); // stays on: the tick draws in after the panel
      done.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    } catch (err) {
      showStatus(
        err instanceof Error && err.message !== 'Request failed'
          ? err.message
          : 'Something went wrong sending your brief. Please try again — or message me on WhatsApp.',
      );
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-busy');
    }
  });

  // ── Start over / welcome back ────────────────────────────────────────────
  $('[data-reset]', form)!.addEventListener('click', () => {
    try {
      localStorage.removeItem(STORE);
    } catch {}
    // Uploads already sent stay in R2 under the old id; they're harmless and
    // never linked from a brief.
    window.location.reload();
  });

  const welcome = $('[data-welcome]');
  if (restored && welcome && typeof restored.values.name === 'string' && restored.values.name) {
    $('[data-welcome-name]', welcome)!.textContent = restored.values.name.split(' ')[0];
    welcome.hidden = false;
    $('[data-welcome-reset]', welcome)!.addEventListener('click', () => $<HTMLButtonElement>('[data-reset]', form)!.click());
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  writeValues(state.values);
  applyConditions(false);
  render('none');
  form.classList.add('is-ready');
}

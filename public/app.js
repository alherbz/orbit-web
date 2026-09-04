const chip = document.querySelector('#health-chip');
const chipText = chip.querySelector('.chip-text');
const skeleton = document.querySelector('#skeleton');
const list = document.querySelector('#tasks');
const emptyState = document.querySelector('#empty');
const errorState = document.querySelector('#error');
const countEl = document.querySelector('#count');
const filterButtons = [...document.querySelectorAll('.filter')];
const newTaskForm = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');
const priorityInput = document.querySelector('#priority');
const submitBtn = newTaskForm.querySelector('button[type="submit"]');
const formMsg = document.querySelector('#form-msg');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let tasks = [];
let filter = 'all';

// ---------- Health chip ----------
// Polled once at load: green with the storage word when the API answers,
// muted with a short message when it does not.
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    chip.classList.add('chip--ok');
    chipText.textContent = `API online · ${body.storage || 'unknown storage'}`;
  } catch {
    chip.classList.add('chip--down');
    chipText.textContent = 'API unreachable';
  }
}

// ---------- Board states ----------
function showBoard(state) {
  skeleton.hidden = state !== 'loading';
  list.hidden = state !== 'list';
  emptyState.hidden = state !== 'empty';
  errorState.hidden = state !== 'error';
}

async function load() {
  showBoard('loading');
  countEl.textContent = '';
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `the server answered HTTP ${res.status}`);
    }
    tasks = await res.json();
    render();
  } catch (err) {
    errorState.textContent = `Could not load tasks: ${err.message}`;
    showBoard('error');
  }
}

function render() {
  const visible =
    filter === 'open' ? tasks.filter((t) => !t.done)
    : filter === 'done' ? tasks.filter((t) => t.done)
    : tasks;

  const open = tasks.filter((t) => !t.done).length;
  countEl.textContent = tasks.length
    ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${open} open`
    : '';

  if (visible.length === 0) {
    emptyState.textContent =
      tasks.length === 0
        ? 'Nothing in orbit yet — add your first task above.'
        : filter === 'done'
          ? 'Nothing done yet — keep going!'
          : 'No open tasks — everything is done. 🎉';
    showBoard('empty');
    return;
  }

  list.replaceChildren(...visible.map(taskCard));
  showBoard('list');
}

// ---------- Task card ----------
// Built with createElement/textContent so task titles are never parsed as HTML.
function taskCard(t) {
  const li = document.createElement('li');
  li.className = `card${t.done ? ' card--done' : ''}`;

  const row = document.createElement('div');
  row.className = 'card-row';

  const badge = document.createElement('span');
  badge.className = `badge badge--${t.priority}`;
  badge.textContent = t.priority;

  const title = document.createElement('p');
  title.className = 'card-title';
  title.textContent = t.title;

  const doneChip = document.createElement('span');
  doneChip.className = `done-chip${t.done ? ' done-chip--done' : ''}`;
  doneChip.textContent = t.done ? 'Done' : 'Open';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'share-toggle';
  toggle.textContent = 'Share';

  row.append(badge, title, doneChip, toggle);

  const shareForm = document.createElement('form');
  shareForm.className = 'share-form';
  shareForm.hidden = true;

  const label = document.createElement('label');
  label.className = 'sr-only';
  label.htmlFor = `share-email-${t.id}`;
  label.textContent = `Email address to share “${t.title}” with`;

  const input = document.createElement('input');
  input.type = 'email';
  input.id = `share-email-${t.id}`;
  input.placeholder = 'teammate@example.com';
  input.autocomplete = 'email';
  input.required = true;

  const send = document.createElement('button');
  send.type = 'submit';
  send.textContent = 'Send';

  shareForm.append(label, input, send);

  const msg = document.createElement('p');
  msg.className = 'share-msg';
  msg.hidden = true;

  li.append(row, shareForm, msg);
  wireShare({ toggle, shareForm, input, send, msg }, t);
  return li;
}

// Per-card share flow: inline validation, disabled while sending, and a
// success or error line that quotes the server's message.
function wireShare({ toggle, shareForm, input, send, msg }, task) {
  const showMsg = (text, ok) => {
    msg.textContent = text;
    msg.className = `share-msg ${ok ? 'ok' : 'err'}`;
    msg.hidden = false;
  };

  toggle.addEventListener('click', () => {
    shareForm.hidden = !shareForm.hidden;
    msg.hidden = true;
    input.removeAttribute('aria-invalid');
    if (!shareForm.hidden) input.focus();
  });

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    if (!msg.hidden && msg.classList.contains('err')) msg.hidden = true;
  });

  shareForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      input.setAttribute('aria-invalid', 'true');
      showMsg('Enter a valid email address, like teammate@example.com.', false);
      input.focus();
      return;
    }
    send.disabled = true;
    const idleLabel = send.textContent;
    send.textContent = 'Sending…';
    try {
      const res = await fetch(`/api/tasks/${task.id}/share`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg(`Shared with ${email}.`, true);
        shareForm.hidden = true;
        input.value = '';
      } else {
        const detail = body.providerMessage ? `: ${body.providerMessage}` : '';
        showMsg(`${body.error || `Share failed (HTTP ${res.status})`}${detail}`, false);
      }
    } catch (err) {
      showMsg(`Share failed: ${err.message}`, false);
    } finally {
      send.disabled = false;
      send.textContent = idleLabel;
    }
  });
}

// ---------- Filters ----------
for (const btn of filterButtons) {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    for (const b of filterButtons) {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    }
    render();
  });
}

// ---------- New task ----------
newTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { title: titleInput.value.trim(), priority: priorityInput.value };
  if (!body.title) return;
  submitBtn.disabled = true;
  formMsg.hidden = true;
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const resBody = await res.json().catch(() => ({}));
      throw new Error(resBody.error || `the server answered HTTP ${res.status}`);
    }
    titleInput.value = '';
    await load();
  } catch (err) {
    formMsg.textContent = `Could not add the task: ${err.message}`;
    formMsg.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- Welcome modal — greets users on their first visit ----------
(function initWelcomeModal() {
  const overlay = document.querySelector('#welcome-overlay');
  const closeBtn = document.querySelector('#welcome-close');
  if (!overlay || !closeBtn) return;

  const STORAGE_KEY = 'orbit-welcome-seen';
  let alreadySeen = false;
  try {
    alreadySeen = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    /* localStorage unavailable — show the modal anyway */
  }

  if (alreadySeen) return;
  overlay.hidden = false;

  const dismiss = () => {
    overlay.hidden = true;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore storage errors */
    }
  };

  closeBtn.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) dismiss();
  });
})();

checkHealth();
load();

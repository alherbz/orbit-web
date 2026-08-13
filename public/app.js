const list = document.querySelector('#tasks');
const status = document.querySelector('#status');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');
const priorityInput = document.querySelector('#priority');

async function load() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error(`API ${res.status}`);
    const tasks = await res.json();
    render(tasks);
    status.textContent = `${tasks.length} tasks · served by orbit-api`;
  } catch (err) {
    status.textContent = `Could not reach the API: ${err.message}`;
  }
}

function render(tasks) {
  list.innerHTML = '';
  for (const t of tasks) {
    const li = document.createElement('li');
    li.className = `task ${t.done ? 'done' : ''}`;
    li.innerHTML = `
      <span class="dot p-${t.priority}"></span>
      <span class="title">${t.title}</span>
      <span class="badge">${t.priority}</span>
      <button type="button" class="share-toggle">Share</button>
      <form class="share-form" hidden>
        <input type="email" placeholder="teammate@example.com" required />
        <button type="submit">Send</button>
      </form>
      <p class="share-msg" hidden></p>
    `;
    wireShare(li, t);
    list.appendChild(li);
  }
}

// Per-row share flow: reveal an inline email form, POST to the API through
// the same-origin /api proxy, and report the outcome next to the task.
function wireShare(li, task) {
  const toggle = li.querySelector('.share-toggle');
  const form = li.querySelector('.share-form');
  const input = form.querySelector('input');
  const send = form.querySelector('button');
  const msg = li.querySelector('.share-msg');

  const showMsg = (text, ok) => {
    msg.textContent = text;
    msg.className = `share-msg ${ok ? 'ok' : 'err'}`;
    msg.hidden = false;
  };

  toggle.addEventListener('click', () => {
    form.hidden = !form.hidden;
    msg.hidden = true;
    if (!form.hidden) input.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;
    send.disabled = true;
    try {
      const res = await fetch(`/api/tasks/${task.id}/share`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg(`Shared with ${email}`, true);
        form.hidden = true;
        input.value = '';
      } else {
        const detail = body.providerMessage ? `: ${body.providerMessage}` : '';
        showMsg(`${body.error || `Share failed (HTTP ${res.status})`}${detail}`, false);
      }
    } catch (err) {
      showMsg(`Share failed: ${err.message}`, false);
    } finally {
      send.disabled = false;
    }
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { title: titleInput.value.trim(), priority: priorityInput.value };
  if (!body.title) return;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  titleInput.value = '';
  load();
});

// Welcome modal — greets users on their first visit.
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

load();

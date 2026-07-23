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
    `;
    list.appendChild(li);
  }
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

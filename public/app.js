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

load();

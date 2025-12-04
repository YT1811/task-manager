import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import './style.css';

let tasks = [];

// Last inn oppgaver
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) {
    tasks = JSON.parse(saved).map(t => ({
      ...t,
      deadline: t.deadline ? new Date(t.deadline) : null,
      createdAt: new Date(t.createdAt)
    }));
  }
  renderTasks();
}

// Lagre oppgaver
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Legg til oppgave
function addTask() {
  const input = document.getElementById('taskInput');
  const deadlineInput = document.getElementById('deadlineInput');
  
  if (!input.value.trim()) return;

  const task = {
    id: uuidv4(),
    text: input.value,
    completed: false,
    deadline: deadlineInput.value ? new Date(deadlineInput.value) : null,
    createdAt: new Date()
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();

  input.value = '';
  deadlineInput.value = '';
}

// Toggle oppgave
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Slett oppgave
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Sjekk om forfalt
function isOverdue(deadline) {
  return deadline && new Date() > deadline;
}

// Render oppgaver
function renderTasks() {
  const taskList = document.getElementById('taskList');
  const stats = document.getElementById('stats');

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🎉</div>
        <p>Ingen oppgaver! Legg til din første oppgave ovenfor.</p>
      </div>
    `;
    stats.innerHTML = '';
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task ${task.completed ? 'completed' : ''}">
      <div class="checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
      <div class="task-content">
        <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
        ${task.deadline ? `
          <div class="task-meta ${isOverdue(task.deadline) && !task.completed ? 'overdue' : ''}">
            <span>⏰ ${formatDistanceToNow(task.deadline, { locale: nb, addSuffix: true })}</span>
            <span>📅 ${format(task.deadline, 'PPp', { locale: nb })}</span>
          </div>
        ` : ''}
      </div>
      <button class="delete-btn" data-id="${task.id}">🗑️ Slett</button>
    </div>
  `).join('');

  // Event listeners
  document.querySelectorAll('.checkbox').forEach(el => {
    el.addEventListener('click', () => toggleTask(el.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => deleteTask(el.dataset.id));
  });

  const remaining = tasks.filter(t => !t.completed).length;
  stats.innerHTML = `
    <div class="stats-badge">
      ${remaining} av ${tasks.length} oppgaver gjenstår
    </div>
  `;
}

// Event listeners
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// Start app
loadTasks();
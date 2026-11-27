/* ==========================================
   Sophisticated Vanilla JS State & Controller
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State initialization & localStorage persistence
    const STORAGE_KEY = 'todo_app_state_v1';
    
    let state = {
        tasks: [],
        filter: 'all',          // 'all', 'active', 'completed'
        categoryFilter: 'all',  // 'all', 'Work', 'Personal', 'Errands'
        priorityFilter: 'all',  // 'all', 'P0', 'P1', 'P2'
        theme: 'dark'           // 'dark', 'light'
    };

    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskCategoryInput = document.getElementById('task-category');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskListContainer = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    // Stats elements
    const statTotal = document.getElementById('stat-total');
    const statActive = document.getElementById('stat-active');
    const statCompleted = document.getElementById('stat-completed');
    
    // Filters & Actions
    const filterTabs = document.querySelectorAll('.filter-tab');
    const filterCategory = document.getElementById('filter-category');
    const filterPriority = document.getElementById('filter-priority');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Load state from localStorage
    function loadState() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed && Array.isArray(parsed.tasks)) {
                    state.tasks = parsed.tasks;
                }
                if (parsed && parsed.theme) {
                    state.theme = parsed.theme;
                }
            } else {
                // Seed initial sample tasks if empty for wonderful first impression
                state.tasks = [
                    {
                        id: generateId(),
                        title: 'Review quarterly product roadmap and OKRs',
                        priority: 'P0',
                        category: 'Work',
                        dueDate: getFutureDateString(1),
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: generateId(),
                        title: 'Schedule dentist appointment for annual checkup',
                        priority: 'P1',
                        category: 'Personal',
                        dueDate: getFutureDateString(4),
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: generateId(),
                        title: 'Pick up dry cleaning and organic groceries',
                        priority: 'P2',
                        category: 'Errands',
                        dueDate: getFutureDateString(-1), // Overdue test
                        completed: true,
                        createdAt: new Date().toISOString()
                    }
                ];
                saveState();
            }
        } catch (e) {
            console.error('Failed to load state from localStorage:', e);
        }
        applyTheme(state.theme);
    }

    // Save state to localStorage
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                tasks: state.tasks,
                theme: state.theme
            }));
        } catch (e) {
            console.error('Failed to save state to localStorage:', e);
        }
    }

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    function getFutureDateString(daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
    }

    // Theme Management
    function applyTheme(theme) {
        state.theme = theme;
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        saveState();
    });

    // Task CRUD Operations
    function addTask(e) {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;

        const newTask = {
            id: generateId(),
            title: title,
            priority: taskPriorityInput.value,
            category: taskCategoryInput.value,
            dueDate: taskDueDateInput.value || '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        state.tasks.unshift(newTask);
        saveState();
        render();

        // Reset form inputs except priorities/categories if convenient
        taskTitleInput.value = '';
        taskDueDateInput.value = '';
        taskTitleInput.focus();
    }

    function toggleTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveState();
            render();
        }
    }

    function deleteTask(id) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveState();
        render();
    }

    function editTaskInline(id, newTitle) {
        const trimmed = newTitle.trim();
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            if (trimmed) {
                task.title = trimmed;
                saveState();
            } else {
                // If emptied, revert or delete? Revert by re-rendering
                render();
            }
        }
    }

    function clearCompleted() {
        state.tasks = state.tasks.filter(t => !t.completed);
        saveState();
        render();
    }

    // Date formatting and overdue checker
    function formatDueDate(dateStr) {
        if (!dateStr) return '';
        const due = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = due - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let label = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let isOverdue = diffDays < 0;

        if (diffDays === 0) label = 'Today';
        else if (diffDays === 1) label = 'Tomorrow';
        else if (diffDays === -1) label = 'Yesterday';

        return { label, isOverdue };
    }

    // Render Statistics
    function renderStats() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const active = total - completed;

        statTotal.textContent = total;
        statActive.textContent = active;
        statCompleted.textContent = completed;
    }

    // Render Task List
    function render() {
        renderStats();

        // Filter tasks
        const filteredTasks = state.tasks.filter(task => {
            // Status filter
            if (state.filter === 'active' && task.completed) return false;
            if (state.filter === 'completed' && !task.completed) return false;

            // Category filter
            if (state.categoryFilter !== 'all' && task.category !== state.categoryFilter) return false;

            // Priority filter
            if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) return false;

            return true;
        });

        taskListContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');

            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.setAttribute('data-id', task.id);

                const dueInfo = formatDueDate(task.dueDate);

                taskElement.innerHTML = `
                    <div class="task-left">
                        <label class="task-checkbox-wrapper">
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
                        </label>
                        <div class="task-content">
                            <div class="task-text" contenteditable="true" spellcheck="false" title="Click to edit">${escapeHtml(task.title)}</div>
                            <div class="task-meta">
                                <span class="badge badge-${task.priority}">
                                    <i class="fa-solid fa-flag"></i> ${task.priority}
                                </span>
                                <span class="badge badge-category badge-${task.category}">
                                    <i class="fa-solid fa-folder"></i> ${task.category}
                                </span>
                                ${dueInfo.label ? `
                                    <span class="task-due ${dueInfo.isOverdue ? 'overdue' : ''}">
                                        <i class="fa-regular fa-calendar"></i> ${dueInfo.label} ${dueInfo.isOverdue ? '(Overdue)' : ''}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn delete" title="Delete Task" aria-label="Delete Task">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                // Event Listeners for individual task elements
                const checkbox = taskElement.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                const deleteBtn = taskElement.querySelector('.task-action-btn.delete');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                const taskTextDiv = taskElement.querySelector('.task-text');
                taskTextDiv.addEventListener('blur', (e) => {
                    editTaskInline(task.id, e.target.textContent);
                });
                taskTextDiv.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        taskTextDiv.blur();
                    }
                });

                taskListContainer.appendChild(taskElement);
            });
        }
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Event Listeners Setup
    taskForm.addEventListener('submit', addTask);

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            state.filter = e.target.getAttribute('data-filter');
            render();
        });
    });

    filterCategory.addEventListener('change', (e) => {
        state.categoryFilter = e.target.value;
        render();
    });

    filterPriority.addEventListener('change', (e) => {
        state.priorityFilter = e.target.value;
        render();
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Initial load
    loadState();
    render();
});

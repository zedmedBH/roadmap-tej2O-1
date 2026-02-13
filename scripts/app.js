import { checkpoints } from './checkpoints.js';
import { initAuth } from './auth.js';
import { initAdminDashboard } from './admin.js';
import { 
    seedMasterTasks, getMasterTasks, getTeamProgress, 
    getTeamMembers, saveTaskProgress
} from './db.js';

// ==========================================
// 1. GLOBAL STATE & SELECTORS
// ==========================================
let currentUser = null;
let currentTeamId = null;
let currentTasks = [];
let teamProgress = {};

// UI References
const loginOverlay = document.getElementById('login-overlay');
const appNav = document.getElementById('app-nav');
const adminBtn = document.getElementById('admin-btn');
const adminDash = document.getElementById('admin-dashboard');
const container = document.getElementById('timeline-items');

// Modal References
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const assigneeSelect = document.getElementById('task-assignee');
const dateInput = document.getElementById('task-duedate');
const statusSelect = document.getElementById('task-status');
const saveBtn = document.getElementById('save-task-btn');
const closeBtn = document.querySelector('.close-btn');

let activeTask = null; // Stores the task currently open in the modal

// ==========================================
// 2. INITIALIZATION & LOGIN
// ==========================================
initAuth(async (user, dbUser) => {
    console.log("Logged in as:", user.email);
    currentUser = user;
    currentTeamId = dbUser.teamId;

    // --- UI SETUP ---
    loginOverlay.style.display = 'none';
    appNav.classList.remove('hidden');
    document.getElementById('nav-user-name').textContent = user.displayName;
    document.getElementById('nav-user-photo').src = user.photoURL;

    // --- CHECK FOR TEACHER ROLE ---
    // REPLACE THIS with your actual email to test Admin features
    const teacherEmails = ["your.email@school.edu", "teacher@test.com"]; 
    
    if (dbUser.role === 'teacher' || teacherEmails.includes(user.email)) {
        console.log("Teacher Access Granted");
        adminBtn.classList.remove('hidden');
        
        // Open Admin Dashboard
        adminBtn.onclick = () => {
            adminDash.classList.remove('hidden');
            initAdminDashboard(); 
        };

        // Close Admin Dashboard
        document.getElementById('close-admin').onclick = () => {
            adminDash.classList.add('hidden');
        };
    }

    // --- DATA LOADING ---
    await seedMasterTasks(checkpoints); // Ensure DB has tasks
    currentTasks = await getMasterTasks();

    if (currentTeamId) {
        teamProgress = await getTeamProgress(currentTeamId);
        document.getElementById('nav-team-name').textContent = "Team Active";
    } else {
        document.getElementById('nav-team-name').textContent = "No Team Assigned";
    }

    renderTimeline();

}, () => {
    // On Logout
    loginOverlay.style.display = 'flex';
    appNav.classList.add('hidden');
    adminBtn.classList.add('hidden');
});

// ==========================================
// 3. RENDER LOGIC
// ==========================================
function renderTimeline() {
    container.innerHTML = '';

    if (currentTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Loading tasks...</p>';
        return;
    }

    currentTasks.forEach((point, index) => {
        // Get Progress
        const progress = teamProgress[point.id] || {};
        const status = progress.status || 'Not Started';
        const statusClass = status.replace(/\s+/g, ''); 

        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        item.innerHTML = `
            <div class="timeline-marker" style="border-color: ${point.color}; color: ${point.color}">
                ${index + 1}
            </div>
            <div class="timeline-card">
                <div class="card-header-strip" style="background-color: ${point.color}"></div>
                <div class="card-content">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="card-subtitle" style="background-color: ${point.color}">${point.subtitle}</span>
                        ${progress.status ? `<span class="status-badge status-${statusClass}">${status}</span>` : ''}
                    </div>
                    <h3 class="card-title">${point.title}</h3>
                    <p class="card-desc">${point.desc}</p>
                    ${progress.dueDate ? `<div style="margin-top:10px; font-size:0.8rem; color:#666;">📅 Due: ${progress.dueDate}</div>` : ''}
                    ${progress.assigneeName ? `<div style="font-size:0.8rem; color:#666;">👤 ${progress.assigneeName}</div>` : ''}
                </div>
            </div>
        `;

        // Direct Click Listener
        const card = item.querySelector('.timeline-card');
        card.addEventListener('click', () => {
            openModal(point);
        });
        
        container.appendChild(item);
    });
}

// ==========================================
// 4. MODAL LOGIC (THE FIX)
// ==========================================
async function openModal(task) {
    activeTask = task;
    const progress = teamProgress[task.id] || {};
    const assignments = progress.taskAssignments || {}; // Load existing assignments

    // 1. Load Team Members FIRST (so we can build the dropdowns)
    let memberOptions = '<option value="">Unassigned</option>';
    let isReadOnly = true;

    if (currentTeamId) {
        try {
            const members = await getTeamMembers(currentTeamId);
            if (members.length > 0) isReadOnly = false;
            
            // Create the <option> list once to reuse for every task
            memberOptions += members.map(m => 
                `<option value="${m.uid}">${m.email.split('@')[0]}</option>`
            ).join('');
        } catch (err) {
            console.error("Error loading members:", err);
        }
    }

    // 2. Build the Task List with Dropdowns
    // We map over the strings in checkpoints.js and create a row for each
    const taskRows = task.tasks ? task.tasks.map(taskName => {
        const assignedUid = assignments[taskName] || ""; // Get saved UID for this specific task
        
        // Inject the 'selected' attribute into the correct option
        const currentOptions = memberOptions.replace(
            `value="${assignedUid}"`, 
            `value="${assignedUid}" selected`
        );

        return `
            <li class="task-row">
                <span class="task-name">${taskName}</span>
                <select class="task-select" data-task-name="${taskName}" ${isReadOnly ? 'disabled' : ''}>
                    ${currentOptions}
                </select>
            </li>
        `;
    }).join('') : '<li>No sub-tasks defined</li>';

    const resourceList = task.resources ? task.resources.map(r => 
        `<a href="${r.url}" class="btn-resource" target="_blank">${r.label}</a>`
    ).join('') : 'None';

    // 3. Inject HTML
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="color: ${task.color}">${task.title}</h2>
            <span class="modal-meta">${task.subtitle}</span>
        </div>
        <p>${task.desc}</p>
        
        <div style="margin: 20px 0;">
            <strong>Task List & Assignments:</strong>
            <ul class="task-list">
                ${taskRows}
            </ul>
        </div>

        <div class="modal-resources"><strong>Resources:</strong><br/>${resourceList}</div>
    `;

    // 4. Fill Shared Form Data (Date & Status)
    dateInput.value = progress.dueDate || '';
    statusSelect.value = progress.status || 'Not Started';
    
    // Disable controls if read-only (no team)
    dateInput.disabled = isReadOnly;
    statusSelect.disabled = isReadOnly;
    saveBtn.style.display = isReadOnly ? 'none' : 'block';

    // 5. Show Modal
    modalOverlay.classList.remove('hidden');
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
}

// ==========================================
// 5. CLOSE & SAVE LOGIC
// ==========================================

function closeModal() {
    modalOverlay.classList.remove('active'); // Fade out
    
    setTimeout(() => {
        modalOverlay.classList.add('hidden'); // Hide after fade
        // Reset button state
        saveBtn.textContent = "Save Progress";
        saveBtn.disabled = false;
    }, 300); // Matches CSS transition time
}

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

saveBtn.addEventListener('click', async () => {
    if (!currentTeamId || !activeTask) return;

    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    // 1. Scrape all the individual task assignments
    const taskSelects = document.querySelectorAll('.task-select');
    const newAssignments = {};
    
    taskSelects.forEach(select => {
        const taskName = select.getAttribute('data-task-name');
        const uid = select.value;
        if (uid) newAssignments[taskName] = uid;
    });

    // 2. Prepare Data Object
    const data = {
        dueDate: dateInput.value,
        status: statusSelect.value,
        taskAssignments: newAssignments, // Save the map of { "Task Name": "UID" }
        lastUpdated: new Date()
    };

    try {
        await saveTaskProgress(currentTeamId, activeTask.id, data);
        teamProgress[activeTask.id] = data; // Update local state
        renderTimeline(); // Re-render main view
        
        saveBtn.textContent = "Saved!";
        setTimeout(() => {
            closeModal();
        }, 500);
        
    } catch (err) {
        console.error("Save failed:", err);
        saveBtn.textContent = "Error";
        alert("Failed to save.");
    }
});
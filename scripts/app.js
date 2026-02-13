import { checkpoints } from './checkpoints.js';
import { initAuth } from './auth.js';
import { initAdminDashboard } from './admin.js';
import { 
    seedMasterTasks, getMasterTasks, getTeamProgress, 
    getTeamMembers, saveTaskProgress, getAllTeams
} from './db.js';

// ==========================================
// 1. GLOBAL STATE & SELECTORS
// ==========================================
let currentUser = null;
let currentTeamId = null;
let currentTasks = [];
let teamProgress = {};
let isTeacher = false; // NEW: Track role globally

// UI References
const loginOverlay = document.getElementById('login-overlay');
const appNav = document.getElementById('app-nav');
const adminBtn = document.getElementById('admin-btn');
const adminDash = document.getElementById('admin-dashboard');
const container = document.getElementById('timeline-items');
const viewTeamSelect = document.getElementById('view-team-select');
const teamBadge = document.getElementById('nav-team-name'); // Ref for easier updates

// Modal References
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const dateInput = document.getElementById('task-duedate');
const statusSelect = document.getElementById('task-status');
const saveBtn = document.getElementById('save-task-btn');
const closeBtn = document.querySelector('.close-btn');

let activeTask = null;

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

    // --- CHECK ROLE ---
    const teacherEmails = ["your.email@school.edu", "teacher@test.com"]; 
    isTeacher = dbUser.role === 'teacher' || teacherEmails.includes(user.email);

    if (isTeacher) {
        console.log("Teacher Access Granted");
        adminBtn.classList.remove('hidden');
        viewTeamSelect.classList.remove('hidden');

        // 1. Setup Admin Dashboard
        adminBtn.onclick = () => {
            adminDash.classList.remove('hidden');
            initAdminDashboard(async (teamId, teamName) => {
                viewTeamSelect.value = teamId;
                viewTeamSelect.dispatchEvent(new Event('change'));
                adminDash.classList.add('hidden');
            });
        };
        document.getElementById('close-admin').onclick = () => adminDash.classList.add('hidden');

        // 2. Populate Dropdown
        const allTeams = await getAllTeams();
        allTeams.forEach(team => {
            const opt = document.createElement('option');
            opt.value = team.id;
            opt.textContent = `View: ${team.name}`;
            viewTeamSelect.appendChild(opt);
        });

        // 3. Dropdown Change Listener
        viewTeamSelect.addEventListener('change', async (e) => {
            const selectedId = e.target.value;

            if (selectedId) {
                // VIEWING A TEAM
                currentTeamId = selectedId;
                teamProgress = await getTeamProgress(selectedId);
                
                const teamName = e.target.options[e.target.selectedIndex].text.replace('View: ', '');
                teamBadge.textContent = `Viewing: ${teamName}`;
                teamBadge.style.backgroundColor = "#ff9f43"; // Orange (Spectator)
            } else {
                // RESET VIEW
                currentTeamId = isTeacher ? null : dbUser.teamId; // Teachers go back to null
                
                if (isTeacher) {
                    // Teacher Reset
                    teamProgress = {}; 
                    teamBadge.textContent = "Teacher";
                    teamBadge.style.backgroundColor = "#2d3436"; // Dark Grey
                } else {
                    // Student Reset
                    if(currentTeamId) {
                        teamProgress = await getTeamProgress(currentTeamId);
                        teamBadge.textContent = "Team Active";
                        teamBadge.style.backgroundColor = "#6c5ce7"; // Purple
                    } else {
                        teamProgress = {};
                        teamBadge.textContent = "No Team Assigned";
                    }
                }
            }
            renderTimeline();
        });
    }

    // --- DATA LOADING & INITIAL LABEL ---
    await seedMasterTasks(checkpoints);
    currentTasks = await getMasterTasks();

    if (isTeacher) {
        // TEACHER DEFAULT STATE
        teamBadge.textContent = "Teacher";
        teamBadge.style.backgroundColor = "#2d3436"; 
    } else if (currentTeamId) {
        // STUDENT TEAM STATE
        teamProgress = await getTeamProgress(currentTeamId);
        teamBadge.textContent = "Team Active";
    } else {
        // STUDENT NO-TEAM STATE
        teamBadge.textContent = "No Team Assigned";
    }

    renderTimeline();

}, () => {
    // On Logout
    loginOverlay.style.display = 'flex';
    appNav.classList.add('hidden');
    adminBtn.classList.add('hidden');
    viewTeamSelect.classList.add('hidden');
    isTeacher = false;
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
                </div>
            </div>
        `;

        item.querySelector('.timeline-card').addEventListener('click', () => {
            openModal(point);
        });
        
        container.appendChild(item);
    });
}

// ==========================================
// 4. MODAL LOGIC (Granular Assignments)
// ==========================================
async function openModal(task) {
    activeTask = task;
    const progress = teamProgress[task.id] || {};
    const assignments = progress.taskAssignments || {};
    const completions = progress.taskCompletions || {}; // <--- NEW: Load completion status

    let memberOptions = '<option value="">Unassigned</option>';
    let isReadOnly = true;

    // Load Members
    if (currentTeamId) {
        try {
            const members = await getTeamMembers(currentTeamId);
            if (members.length > 0) isReadOnly = false;
            
            memberOptions += members.map(m => 
                `<option value="${m.uid}">${m.email.split('@')[0]}</option>`
            ).join('');
        } catch (err) {
            console.error("Error loading members:", err);
        }
    }

    // Build Task Rows with Checkbox AND Dropdown
    const taskRows = task.tasks ? task.tasks.map(taskName => {
        const assignedUid = assignments[taskName] || "";
        const isChecked = completions[taskName] ? "checked" : ""; // Check if completed
        
        const currentOptions = memberOptions.replace(
            `value="${assignedUid}"`, 
            `value="${assignedUid}" selected`
        );

        return `
            <li class="task-row">
                <input type="checkbox" class="task-status-checkbox" data-task-name="${taskName}" ${isChecked} ${isReadOnly ? 'disabled' : ''}>
                
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

    dateInput.value = progress.dueDate || '';
    statusSelect.value = progress.status || 'Not Started';
    
    dateInput.disabled = isReadOnly;
    statusSelect.disabled = isReadOnly;
    saveBtn.style.display = isReadOnly ? 'none' : 'block';

    modalOverlay.classList.remove('hidden');
    setTimeout(() => modalOverlay.classList.add('active'), 10);
}

// ==========================================
// 5. CLOSE & SAVE LOGIC
// ==========================================
function closeModal() {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        saveBtn.textContent = "Save Progress";
        saveBtn.disabled = false;
    }, 300);
}

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

saveBtn.addEventListener('click', async () => {
    if (!currentTeamId || !activeTask) return;

    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    // 1. Scrape Assignments
    const taskSelects = document.querySelectorAll('.task-select');
    const newAssignments = {};
    taskSelects.forEach(select => {
        const taskName = select.getAttribute('data-task-name');
        const uid = select.value;
        if (uid) newAssignments[taskName] = uid;
    });

    // 2. Scrape Completion Status (NEW)
    const taskCheckboxes = document.querySelectorAll('.task-status-checkbox');
    const newCompletions = {};
    taskCheckboxes.forEach(box => {
        const taskName = box.getAttribute('data-task-name');
        newCompletions[taskName] = box.checked; // true or false
    });

    const data = {
        dueDate: dateInput.value,
        status: statusSelect.value,
        taskAssignments: newAssignments,
        taskCompletions: newCompletions, // Save the booleans
        lastUpdated: new Date()
    };

    try {
        await saveTaskProgress(currentTeamId, activeTask.id, data);
        teamProgress[activeTask.id] = data; 
        renderTimeline(); 
        
        saveBtn.textContent = "Saved!";
        setTimeout(() => closeModal(), 500);
        
    } catch (err) {
        console.error("Save failed:", err);
        saveBtn.textContent = "Error";
        alert("Failed to save.");
    }
});
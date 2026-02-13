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

    // MOBILE MENU LOGIC
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const navControls = document.getElementById('nav-controls');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            // Toggle the menu visibility
            navControls.classList.toggle('active');
            // Toggle the 'X' animation on the button
            mobileBtn.classList.toggle('open');
        });
    }

    // Close mobile menu when a user clicks a dropdown item or button
    navControls.addEventListener('click', (e) => {
        // Only close if we are actually on mobile (check if hamburger is visible)
        if (window.getComputedStyle(mobileBtn).display !== 'none') {
            // Don't close if they just clicked the select box itself (to avoid frustration)
            if (e.target.tagName !== 'SELECT') {
                navControls.classList.remove('active');
                mobileBtn.classList.remove('open');
            }
        }
    });

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
    const completions = progress.taskCompletions || {};
    const roles = progress.roles || {};

    let memberOptions = '<option value="" disabled selected>Add...</option>';
    let isReadOnly = true;
    let members = [];

    // Load Members
    if (currentTeamId) {
        try {
            members = await getTeamMembers(currentTeamId);
            if (members.length > 0) isReadOnly = false;
            
            memberOptions += members.map(m => 
                `<option value="${m.uid}">${m.email.split('@')[0]}</option>`
            ).join('');
        } catch (err) {
            console.error("Error loading members:", err);
        }
    }

    // --- BUILD ROLE SECTION (Keep existing) ---
    let roleSection = '';
    if (task.title.startsWith("Build")) {
        const createRoleSelect = (roleKey, label) => {
            const savedUid = roles[roleKey] || "";
            // Reuse the member options but remove the "Add..." default for a standard select
            const roleOpts = memberOptions.replace('disabled selected>Add...', '>Unassigned')
                .replace(`value="${savedUid}"`, `value="${savedUid}" selected`);
                
            return `
                <div class="role-group">
                    <label class="role-label">${label}</label>
                    <select class="role-select" data-role="${roleKey}" ${isReadOnly ? 'disabled' : ''}>
                        ${roleOpts}
                    </select>
                </div>
            `;
        };
        roleSection = `
            <div class="role-container">
                <span class="role-header">Session Roles</span>
                <div class="role-grid">
                    ${createRoleSelect('leadBuilder', 'Lead Builder')}
                    ${createRoleSelect('supportBuilder', 'Support Builder')}
                    ${createRoleSelect('leadCutter', 'Lead Cutter')}
                    ${createRoleSelect('supportCutter', 'Support Cutter')}
                </div>
            </div>
        `;
    }

    // --- TASK LIST WITH MULTI-SELECT ---
    const taskRows = task.tasks ? task.tasks.map(taskName => {
        // Handle old data (string) vs new data (array)
        let assignedUids = assignments[taskName] || [];
        if (typeof assignedUids === 'string') assignedUids = [assignedUids];

        const isChecked = completions[taskName] ? "checked" : "";
        
        // Generate Tags
        const tagsHtml = assignedUids.map(uid => {
            const member = members.find(m => m.uid === uid);
            const name = member ? member.email.split('@')[0] : "Unknown";
            return `
                <div class="assignee-tag" data-uid="${uid}">
                    ${name}
                    ${!isReadOnly ? '<span class="assignee-remove">&times;</span>' : ''}
                </div>
            `;
        }).join('');

        // The "+" Dropdown
        // Note: We added 'style="color:transparent"' inline as a backup to CSS
        const addDropdown = !isReadOnly ? `
            <select class="add-assignee-select" data-task-name="${taskName}">
                ${memberOptions}
            </select>
        ` : '';

        return `
            <li class="task-row">
                <input type="checkbox" class="task-status-checkbox" data-task-name="${taskName}" ${isChecked} ${isReadOnly ? 'disabled' : ''}>
                
                <div class="task-content-wrapper">
                    <span class="task-name">${taskName}</span>
                    
                    <div class="assignee-container" id="container-${taskName.replace(/\s/g, '')}">
                        ${tagsHtml}
                        ${addDropdown}
                    </div>
                </div>
            </li>
        `;
    }).join('') : '<li>No sub-tasks defined</li>';

    // ... [Date & Resource Logic same as before] ...
    // Calculate Calendar Link
    const getCalDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "").split("T")[0];
        return `${fmt(date)}/${fmt(nextDay)}`;
    };
    const calDates = getCalDate(progress.dueDate);
    const calTitle = encodeURIComponent(`Due: ${task.title} (${task.subtitle})`);
    const calDesc = encodeURIComponent(`Task: ${task.desc}\n\nLink: ${window.location.href}`);
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDesc}&dates=${calDates}`;

    // RENDER
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="color: ${task.color}">${task.title}</h2>
            <span class="modal-meta">${task.subtitle}</span>
        </div>
        <p>${task.desc}</p>
        ${roleSection}
        <div style="margin: 20px 0;">
            <strong>Task List & Assignments:</strong>
            <ul class="task-list">
                ${taskRows}
            </ul>
        </div>
        <div class="modal-resources"><strong>Resources:</strong><br/>${task.resources ? task.resources.map(r => `<a href="${r.url}" class="btn-resource" target="_blank">${r.label}</a>`).join('') : 'None'}</div>
    `;

    // --- INTERACTIVE EVENT LISTENERS (For Tags) ---
    // We attach one big listener to the modal content for efficiency
    modalContent.onclick = (e) => {
        // Handle "Remove Tag" Click
        if (e.target.classList.contains('assignee-remove')) {
            e.target.closest('.assignee-tag').remove();
        }
    };

    modalContent.onchange = (e) => {
        // Handle "Add Assignee" Selection
        if (e.target.classList.contains('add-assignee-select')) {
            const select = e.target;
            const uid = select.value;
            const name = select.options[select.selectedIndex].text;
            
            // Check for duplicates in this specific container
            const container = select.parentNode;
            const existing = container.querySelectorAll(`.assignee-tag[data-uid="${uid}"]`);
            
            if (existing.length === 0) {
                // Create new tag HTML
                const tag = document.createElement('div');
                tag.className = 'assignee-tag';
                tag.setAttribute('data-uid', uid);
                tag.innerHTML = `${name} <span class="assignee-remove">&times;</span>`;
                
                // Insert before the dropdown
                container.insertBefore(tag, select);
            }
            
            // Reset dropdown
            select.value = "";
        }
    };

    // Form Controls
    const dateContainer = document.getElementById('task-duedate').parentNode;
    let calBtn = document.getElementById('add-to-cal-btn');
    if (!calBtn) {
        calBtn = document.createElement('a');
        calBtn.id = 'add-to-cal-btn';
        calBtn.className = 'btn-calendar';
        calBtn.target = '_blank';
        calBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`;
        dateContainer.style.display = 'flex'; 
        dateContainer.style.gap = '5px';
        dateContainer.appendChild(calBtn);
    }

    if (progress.dueDate) {
        calBtn.href = calUrl;
        calBtn.style.display = 'flex';
        calBtn.title = "Add to Google Calendar";
    } else {
        calBtn.style.display = 'none';
    }

    dateInput.value = progress.dueDate || '';
    statusSelect.value = progress.status || 'Not Started';
    dateInput.disabled = isReadOnly;
    statusSelect.disabled = isReadOnly;
    saveBtn.style.display = isReadOnly ? 'none' : 'block';

    // Show Modal
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

    // 1. Scrape Multi-Select Assignments
    // We iterate over the checkboxes to get the list of task names
    const taskCheckboxes = document.querySelectorAll('.task-status-checkbox');
    const newAssignments = {};
    const newCompletions = {};

    taskCheckboxes.forEach(box => {
        const taskName = box.getAttribute('data-task-name');
        
        // Save Completion Status
        newCompletions[taskName] = box.checked;

        // Find the container next to this box
        const container = box.nextElementSibling.querySelector('.assignee-container');
        if (container) {
            // Collect all UIDs from tags
            const tags = container.querySelectorAll('.assignee-tag');
            const uids = Array.from(tags).map(t => t.getAttribute('data-uid'));
            newAssignments[taskName] = uids; // Save as Array
        }
    });

    // 2. Scrape Roles
    const roleSelects = document.querySelectorAll('.role-select');
    const newRoles = {};
    roleSelects.forEach(select => {
        const roleKey = select.getAttribute('data-role');
        const uid = select.value;
        if (uid) newRoles[roleKey] = uid;
    });

    const data = {
        dueDate: dateInput.value,
        status: statusSelect.value,
        taskAssignments: newAssignments,
        taskCompletions: newCompletions,
        roles: newRoles,
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
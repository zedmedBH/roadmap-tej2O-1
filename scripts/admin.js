import { 
    createTeam, getAllTeams, addStudentToTeam, getTeamMembers, 
    removeStudentFromTeam, deleteTeam 
} from './db.js';

export function initAdminDashboard(onViewTeam) {
    console.log("Admin Dashboard Initialized");

    const createBtn = document.getElementById('create-team-btn');
    const teamListEl = document.getElementById('admin-team-list');
    const addStudentBtn = document.getElementById('add-student-btn');
    const memberListEl = document.getElementById('team-member-list');
    const teamTitle = document.getElementById('selected-team-title');
    const memberArea = document.getElementById('member-management-area');
    
    // DEFINING THE VARIABLE THAT CAUSED YOUR ERROR
    let selectedTeam = null; 

    // =========================================
    // 1. TEAM LIST LOGIC
    // =========================================
    async function refreshTeams() {
        teamListEl.innerHTML = '<li>Loading teams...</li>';
        const teams = await getAllTeams();
        teamListEl.innerHTML = '';
        
        if (teams.length === 0) {
            teamListEl.innerHTML = '<li>No teams found. Create one above!</li>';
            return;
        }

        teams.forEach(team => {
            const li = document.createElement('li');
            li.textContent = team.name;
            li.addEventListener('click', () => selectTeam(team, li));
            teamListEl.appendChild(li);
        });
    }

    // =========================================
    // 2. SELECT TEAM & BUTTONS LOGIC
    // =========================================
    async function selectTeam(team, liElement) {
        selectedTeam = team; // Now this variable exists!
        
        // Highlight UI
        document.querySelectorAll('#admin-team-list li').forEach(el => el.classList.remove('selected'));
        liElement.classList.add('selected');

        // Show Member Area
        memberArea.classList.remove('hidden');
        
        // Render Header with DELETE button
        teamTitle.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width: 100%; margin-bottom: 20px;">
            <span style="font-size: 1.1rem; font-weight: 700;">${team.name}</span>
            <button id="delete-team-btn" class="btn-danger">
                Delete Team
            </button>
        </div>
        `;

        // Listener: Delete Team
        document.getElementById('delete-team-btn').addEventListener('click', async () => {
            const confirmed = confirm(`⚠️ Are you sure you want to delete "${team.name}"?\n\nThis will remove the team and unassign all its members. This action cannot be undone.`);
            
            if (confirmed) {
                const btn = document.getElementById('delete-team-btn');
                btn.textContent = "Deleting...";
                btn.disabled = true;

                try {
                    await deleteTeam(team.id); 
                    
                    // Reset UI
                    memberArea.classList.add('hidden');
                    selectedTeam = null;
                    refreshTeams(); // Reload the list
                    alert("Team deleted successfully.");
                } catch (err) {
                    console.error(err);
                    alert("Error deleting team: " + err.message);
                    btn.textContent = "Delete Team";
                    btn.disabled = false;
                }
            }
        });

        refreshMembers(team.id);
    }

    // =========================================
    // 3. MEMBER MANAGEMENT LOGIC
    // =========================================
    async function refreshMembers(teamId) {
        memberListEl.innerHTML = '<li>Loading members...</li>';
        const members = await getTeamMembers(teamId);
        
        memberListEl.innerHTML = ''; // Clear loading message

        if (!members || members.length === 0) {
            memberListEl.innerHTML = '<li>No members yet.</li>';
        } else {
            members.forEach(member => {
                const li = document.createElement('li');
                
                // HTML: Email + Remove Button
                li.innerHTML = `
                    <span>${member.email}</span>
                    <button class="remove-member-btn">Remove</button>
                `;

                // Listener: Remove Member
                const btn = li.querySelector('.remove-member-btn');
                btn.onclick = async (e) => {
                    e.stopPropagation(); // Stop click from selecting the row
                    
                    if(confirm(`Remove ${member.email} from this team?`)) {
                        btn.textContent = "...";
                        try {
                            await removeStudentFromTeam(teamId, member);
                            refreshMembers(teamId); // Reload list
                        } catch (err) {
                            alert("Error: " + err.message);
                            btn.textContent = "Remove";
                        }
                    }
                };

                memberListEl.appendChild(li);
            });
        }
    }

    // =========================================
    // 4. CREATE TEAM & ADD STUDENT
    // =========================================
    createBtn.onclick = async () => {
        const name = document.getElementById('new-team-name').value;
        if(name) {
            createBtn.textContent = "Creating...";
            await createTeam(name);
            document.getElementById('new-team-name').value = '';
            createBtn.textContent = "Create";
            refreshTeams();
        }
    };

    addStudentBtn.onclick = async () => {
        const email = document.getElementById('new-student-email').value;
        if(email && selectedTeam) {
            addStudentBtn.textContent = "Adding...";
            try {
                await addStudentToTeam(selectedTeam.id, email);
                document.getElementById('new-student-email').value = '';
                refreshMembers(selectedTeam.id);
            } catch(e) {
                alert(e.message);
            }
            addStudentBtn.textContent = "Add Student";
        }
    };

    // Initial Load
    refreshTeams();
}
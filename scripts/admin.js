import { createTeam, getAllTeams, addStudentToTeam, getTeamMembers } from './db.js';

export function initAdminDashboard() {
    console.log("Admin Dashboard Initialized"); // Debug log

    const createBtn = document.getElementById('create-team-btn');
    const teamListEl = document.getElementById('admin-team-list');
    const addStudentBtn = document.getElementById('add-student-btn');
    const memberListEl = document.getElementById('team-member-list');
    
    let selectedTeamId = null;

    // Load Teams
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

    // Select Team Logic
    async function selectTeam(team, liElement) {
        selectedTeamId = team.id;
        
        // Highlight UI
        document.querySelectorAll('#admin-team-list li').forEach(el => el.classList.remove('selected'));
        liElement.classList.add('selected');

        // Show Member Area
        document.getElementById('member-management-area').classList.remove('hidden');
        document.getElementById('selected-team-title').textContent = team.name;

        refreshMembers(team.id);
    }

    async function refreshMembers(teamId) {
        memberListEl.innerHTML = '<li>Loading members...</li>';
        const members = await getTeamMembers(teamId);
        
        if (!members || members.length === 0) {
            memberListEl.innerHTML = '<li>No members yet.</li>';
        } else {
            memberListEl.innerHTML = members.map(m => `<li>${m.email}</li>`).join('');
        }
    }

    // Create Team
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

    // Add Student
    addStudentBtn.onclick = async () => {
        const email = document.getElementById('new-student-email').value;
        if(email && selectedTeamId) {
            addStudentBtn.textContent = "Adding...";
            try {
                await addStudentToTeam(selectedTeamId, email);
                document.getElementById('new-student-email').value = '';
                refreshMembers(selectedTeamId);
            } catch(e) {
                alert(e.message);
            }
            addStudentBtn.textContent = "Add Student";
        }
    };

    // Initial Load
    refreshTeams();
}
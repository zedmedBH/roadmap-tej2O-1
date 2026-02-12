// ==========================================
// 1. DATA CONFIGURATION
// ==========================================

const checkpoints = [
    { 
        phase: 1,
        title: "Stage 1", 
        subtitle: "Holonomic Drive",
        desc: "Build chassis frame, install motors, and attach mecanum wheels.",
        color: "#00C853", 
        tasks: ["Build chassis frame", "Install 4 motors", "Attach mecanum wheels","QC: Check wheel X pattern & frame squareness."],
        resources: [{ label: "Pages 4-23", url: "#" }]
    },
    { 
        phase: 2,
        title: "Planning", 
        subtitle: "Gantt Chart",
        desc: "Make a copy of the Gantt chart and assign tasks. Deadline May 1st.",
        color: "#7269be", 
        tasks: ["Complete Gantt Chart","Add link to Engineering Journal"],
        resources: [{ label: "Video: Gantt Chart", url: "#" }]
    },
    { 
        phase: 3,
        title: "Testing 1", 
        subtitle: "Drivetrain",
        desc: "Watch the videos for an introduction to various tests.",
        color: "#FF3D00", 
        tasks: ["Connect Brain and Battery","Pairing Controller","Sample Drivetrain Code"],
        resources: [{ label: "Wiring Diagram", url: "#" }, { label: "Pairing Controller ", url: "#"}, { label: "Github Repo", url: "#"} ]
    },
    { 
        phase: 4,
        title: "Stage 3", 
        subtitle: "Support Motor",
        desc: "Assemble and install the support motor mechanism.",
        color: "#00C853", 
        tasks: ["Build mechanism","Install"],
        resources: [{ label: "Pages 24-31", url: "#" }]
    },
    { 
        phase: 5,
        title: "Testing 2", 
        subtitle: "Code motor limits",
        desc: "Modify code to incorporate new motor. Determine stopping limits.",
        color: "#FF3D00", 
        tasks: ["Update Code"],
        resources: [{ label: "Video: Motor Limits", url: "#" }]
    },
    { 
        phase: 6,
        title: "Stage 4", 
        subtitle: "Top Lift Motor",
        desc: "Assemble intake chains for drivetrain. Install the top lift motor.",
        color: "#00C853", 
        tasks: ["Assemble drivetrain chains", "Mount top lift motor"],
        resources: [{ label: "Pages 32-49", url: "#" }]
    },
    { 
        phase: 7,
        title: "Stage 5", 
        subtitle: "Lift Assembly",
        desc: "Construct lift arms and ensure symmetric height movement.",
        color: "#00C853", 
        tasks: ["Assemble chains", "Mount intake"],
        resources: [{ label: "Pages 50-66", url: "#" }]
    },
    { 
        phase: 8,
        title: "Testing 3", 
        subtitle: "Box Fit",
        desc: "Without power, test the mechanism with boxes.",
        color: "#FF3D00", 
        tasks: ["Complete test"],
        resources: [{ label: "None", url: "#" }]
    },
    { 
        phase: 9,
        title: "Stage 6", 
        subtitle: "Finalize Assembly",
        desc: "Final cable management, battery checks, and driver practice.",
        color: "#00C853", 
        tasks: ["Cable management", "Final assembly"],
        resources: [{ label: "Pages 66-71", url: "#" }]
    }
];

// ==========================================
// 2. RENDER LOGIC
// ==========================================

const container = document.getElementById('timeline-items');

function renderTimeline() {
    container.innerHTML = '';

    checkpoints.forEach((point, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        // Use data attributes to store info for click handlers
        item.dataset.index = index;

        item.innerHTML = `
            <div class="timeline-marker" style="border-color: ${point.color}; color: ${point.color}">
                ${index + 1}
            </div>
            <div class="timeline-card">
                <div class="card-header-strip" style="background-color: ${point.color}"></div>
                <div class="card-content">
                    <span class="card-subtitle" style="background-color: ${point.color}">${point.subtitle}</span>
                    <h3 class="card-title">${point.title}</h3>
                    <p class="card-desc">${point.desc}</p>
                </div>
            </div>
        `;

        // Add Click Listener
        item.querySelector('.timeline-card').addEventListener('click', () => openModal(point));
        
        container.appendChild(item);
    });
}

// ==========================================
// 3. MODAL LOGIC
// ==========================================

const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeBtn = document.querySelector('.close-btn');

function openModal(data) {
    const taskList = data.tasks.map(t => `<li>${t}</li>`).join('');
    const resourceList = data.resources.map(r => 
        `<a href="${r.url}" class="btn-resource" target="_blank">${r.label}</a>`
    ).join('');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="color: ${data.color}">${data.title}</h2>
            <span class="modal-meta">${data.subtitle}</span>
        </div>
        <p>${data.desc}</p>
        <ul class="task-list">
            ${taskList}
        </ul>
        <div class="modal-resources">
            <strong>Resources:</strong><br/>
            ${resourceList}
        </div>
    `;

    modalOverlay.classList.remove('hidden');
    // slight delay to allow display:block to apply before opacity transition
    setTimeout(() => modalOverlay.classList.add('active'), 10);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
    }, 300); // match css transition
}

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Initialize
renderTimeline();
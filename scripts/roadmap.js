// ==========================================
// 1. DATA CONFIGURATION
// ==========================================

import { checkpoints } from './checkpoints.js';

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
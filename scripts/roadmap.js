// ==========================================
// 1. DATA CONFIGURATION
// ==========================================
const checkpoints = [
    { 
        phase: 1,
        title: "Holonomic Drivetrain", 
        pages: "Pages 4–22", 
        imgSrc: "../img/phase1.png", // Expects image here
        color: "#00C853", 
        tasks: [
            "Build chassis frame",
            "Install 4 motors",
            "Attach mecanum wheels"
        ],
        qc: "Check wheel 'X' pattern & frame squareness.",
        challenge: "Drive Test: Program basic forward/backward movement.",
        resources: [
            { label: "VEX V5 Motor Setup", url: "#" },
            { label: "Drivetrain Coding Guide", url: "#" }
        ]
    },
    { 
        phase: 2,
        title: "Towers & Electronics", 
        pages: "Pages 23–31", 
        imgSrc: "../img/phase2.png",
        color: "#FF3D00", 
        tasks: [
            "Build vertical towers",
            "Mount V5 Brain"
        ],
        qc: "Ensure towers are parallel & Brain is accessible.",
        challenge: "Systems Check: Verify motor ports on Brain screen.",
        resources: [
            { label: "Brain Wiring Diagram", url: "#" }
        ]
    },
    { 
        phase: 3,
        title: "Lift Assembly", 
        pages: "Pages 32–49", 
        imgSrc: "../img/phase3.png",
        color: "#2962FF", 
        tasks: [
            "Build lift arms",
            "Install lift motors"
        ],
        qc: "Check for friction/binding & symmetric height.",
        challenge: "Lift Limits: Code lift to specific heights (e.g., 'Low', 'High').",
        resources: [
            { label: "PID Control Basics", url: "#" }
        ]
    },
    { 
        phase: 4,
        title: "Intake Mechanism", 
        pages: "Pages 50–65", 
        imgSrc: "../img/phase4.png",
        color: "#FF3D00", 
        tasks: [
            "Assemble intake chains",
            "Mount intake motors"
        ],
        qc: "Check chain tension & flap clearance.",
        challenge: "Intake/Outtake: Map intake spin to controller buttons.",
        resources: [
            { label: "Chain Tension Guide", url: "#" }
        ]
    },
    { 
        phase: 5,
        title: "Final Integration", 
        pages: "Pages 66–71", 
        imgSrc: "../img/phase5.png",
        color: "#00C853", 
        tasks: [
            "Cable management",
            "Final assembly"
        ],
        qc: "\"Pinch\" test cables & secure battery.",
        challenge: "Driver Control: Map all functions to controller for full drive.",
        resources: [
            { label: "Competition Checklist", url: "#" }
        ]
    }
];

// -- PRELOAD IMAGES --
// This ensures images are ready before we try to draw them on canvas
checkpoints.forEach(cp => {
    cp.imgObj = new Image();
    cp.imgObj.src = cp.imgSrc;
    cp.imgLoaded = false;

    cp.imgObj.onload = () => {
        cp.imgLoaded = true;
        drawRoadmap(); // Redraw once image is ready
    };
    cp.imgObj.onerror = () => {
        cp.imgLoaded = false; // Flag to use fallback
    };
});

// ==========================================
// 2. SETUP & STATE
// ==========================================
const canvas = document.getElementById('roadmapCanvas');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const closeBtn = document.querySelector('.close-btn');

let nodePositions = []; 
let isMobile = false;
let hoveredIndex = -1; 

// ==========================================
// 3. CORE DRAWING LOGIC
// ==========================================

function resizeAndDraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isMobile = canvas.width < canvas.height;
    drawRoadmap();
}

function drawRoadmap() {
    const width = canvas.width;
    const height = canvas.height;
    
    const padding = isMobile ? 100 : 150; 
    const amplitude = isMobile ? width / 3.5 : height / 5; 
    
    ctx.clearRect(0, 0, width, height);

    // -- CALCULATE PATH --
    const points = [];
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        let x, y;

        if (isMobile) {
            const startY = padding;
            const endY = height - padding;
            y = startY + t * (endY - startY);
            x = (width / 2) + Math.sin(t * Math.PI * 3) * amplitude;
        } else {
            const startX = padding;
            const endX = width - padding;
            x = startX + t * (endX - startX);
            y = (height / 2) + Math.sin(t * Math.PI * 3) * amplitude;
        }
        points.push({x, y});
    }

    // 1. Draw Casing
    ctx.beginPath();
    ctx.lineWidth = isMobile ? 42 : 54; 
    ctx.strokeStyle = '#e0e0e0'; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawPath(points);
    ctx.stroke();

    // 2. Draw Road
    ctx.beginPath();
    ctx.lineWidth = isMobile ? 30 : 40;
    ctx.strokeStyle = '#444'; 
    drawPath(points);
    ctx.stroke();

    // 3. Draw Center Dashes
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([12, 12]);
    drawPath(points);
    ctx.stroke();
    ctx.setLineDash([]); 

    // -- DRAW NODES --
    drawNodes(width, height, padding, amplitude);
}

function drawPath(points) {
    if(points.length === 0) return;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
}

function drawNodes(width, height, padding, amplitude) {
    nodePositions = []; 
    const totalPoints = checkpoints.length;

    checkpoints.forEach((point, index) => {
        const t = index / (totalPoints - 1);
        let x, y;

        if (isMobile) {
            const startY = padding;
            const endY = height - padding;
            y = startY + t * (endY - startY);
            x = (width / 2) + Math.sin(t * Math.PI * 3) * amplitude;
        } else {
            const startX = padding;
            const endX = width - padding;
            x = startX + t * (endX - startX);
            y = (height / 2) + Math.sin(t * Math.PI * 3) * amplitude;
        }

        const isHovered = (index === hoveredIndex);
        const radius = isHovered ? 32 : 25; 

        nodePositions.push({ x, y, data: point, radius: radius });

        // -- DRAW SHADOW --
        ctx.beginPath();
        ctx.arc(x, y + 4, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        // -- HOVER GLOW --
        if (isHovered) {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowBlur = 0;
        }

        // -- DRAW CIRCLE CONTENT --
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        // CHECK: Do we have a loaded image?
        if (point.imgLoaded) {
            ctx.save();
            ctx.clip(); // Clip everything to the circle we just defined
            // Draw image centered in circle
            ctx.drawImage(point.imgObj, x - radius, y - radius, radius * 2, radius * 2);
            ctx.restore();
        } else {
            // FALLBACK: Draw solid color + Number
            ctx.fillStyle = point.color;
            ctx.fill();
            
            // Number Text
            ctx.shadowBlur = 0; // Clear shadow for text
            ctx.fillStyle = 'white';
            ctx.font = isHovered ? 'bold 18px Arial' : 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, x, y);
        }
        
        ctx.shadowBlur = 0; // Reset shadow

        // White Border (Always draw this so the image has a rim)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.lineWidth = isHovered ? 4 : 2; 
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // -- LABELS --
        ctx.font = 'bold 13px Arial';
        
        if (isMobile) {
            ctx.textAlign = 'left';
            const textX = x + (isHovered ? 45 : 35); 
            
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.strokeText(point.title, textX, y);
            
            ctx.fillStyle = '#333';
            ctx.fillText(point.title, textX, y);
        } else {
            ctx.textAlign = 'center';
            const baseOffset = (index % 2 === 0) ? 60 : -60;
            const hoverOffset = (index % 2 === 0) ? 10 : -10;
            const finalOffset = isHovered ? baseOffset + hoverOffset : baseOffset;

            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.strokeText(point.title, x, y + finalOffset);

            ctx.fillStyle = '#333';
            ctx.fillText(point.title, x, y + finalOffset);
        }
    });
}

// ==========================================
// 4. INTERACTION
// ==========================================

function closePopup() {
    popup.style.display = 'none';
}

if (closeBtn) closeBtn.addEventListener('click', closePopup);

canvas.addEventListener('click', (e) => {
    if (hoveredIndex !== -1) {
        const node = nodePositions[hoveredIndex];
        showPopup(node);
    } else {
        closePopup();
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newHoverIndex = -1;

    nodePositions.forEach((node, index) => {
        const dist = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        if (dist < 35) { 
            newHoverIndex = index;
        }
    });

    if (newHoverIndex !== hoveredIndex) {
        hoveredIndex = newHoverIndex;
        canvas.style.cursor = (hoveredIndex !== -1) ? 'pointer' : 'default';
        drawRoadmap(); 
    }
});

function showPopup(node) {
    // Generate Task List
    const taskList = node.data.tasks.map(task => `<li>${task}</li>`).join('');
    
    // Generate Resource Links
    const resourceList = node.data.resources.map(res => 
        `<a href="${res.url}" class="resource-link" target="_blank">📄 ${res.label}</a>`
    ).join('');

    popupContent.innerHTML = `
        <div class="meta">${node.data.pages}</div>
        <h3>${node.data.title}</h3>
        
        <div class="popup-section">
            <h4>Key Tasks</h4>
            <ul>${taskList}</ul>
        </div>

        <div class="popup-section qc-section">
            <strong>QC Check:</strong> ${node.data.qc}
        </div>

        <div class="popup-section code-section">
            <h4>💻 Coding Challenge</h4>
            <p>${node.data.challenge}</p>
        </div>

        <div class="popup-section resources-section">
            <h4>Resources</h4>
            <div class="resource-grid">
                ${resourceList}
            </div>
        </div>
    `;
    
    popup.style.borderLeftColor = node.data.color;

    const pWidth = 320; // Increased width slightly for new content
    const verticalGap = 45; 

    let left = node.x - (pWidth / 2);
    let top;

    popup.classList.remove('arrow-top', 'arrow-bottom');

    // Dynamic Positioning
    if (node.y < window.innerHeight / 2) {
        top = node.y + verticalGap;
        popup.classList.add('arrow-top'); 
    } else {
        // Popups might be taller now, push it up further
        top = node.y - 400; // Adjusted for estimated taller height
        // Safety check to keep it on screen
        if(top < 20) top = 20; 
        popup.classList.add('arrow-bottom'); 
    }

    if (left < 20) left = 20;
    if (left + pWidth > window.innerWidth - 20) left = window.innerWidth - pWidth - 20;

    // Apply Styles
    popup.style.width = pWidth + 'px';
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.display = 'block';
}

window.addEventListener('resize', resizeAndDraw);
resizeAndDraw();
// ==========================================
// 1. DATA & THEME CONFIGURATION
// ==========================================

// Centralized visual styles for the Canvas
const THEME = {
    road: {
        outerColor: '#e0e0e0',
        innerColor: '#444444',
        dashColor: '#ffffff',
        widthOuter: 60,
        widthInner: 44
    },
    card: {
        width: 180,
        height: 200,
        radius: 20,
        shadow: 'rgba(0,0,0,0.15)'
    },
    font: {
        cardTitle: "bold 16px Arial",
        cardDesc: "13px Arial",
        nodeNum: "bold 20px Arial",
        nodeNumHover: "bold 24px Arial"
    }
};

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
        desc: "As a team, make a copy of the Gannt chart and assign the remaining tasks. Deadline May 1st.",
        color: "#7269be", 
        tasks: ["Complete Gantt Chart","Add link to Engineering Journal"],
        resources: [{ label: "Video: Gantt Chart", url: "#" }]
    },
{ 
        phase: 3,
        title: "Testing 1", 
        subtitle: "Drivetrain",
        desc: "Watch the videos to an introduction to various tests.",
        color: "#FF3D00", 
        tasks: ["Connect Brain and Battery","Pairing Controller","Sample Drivetrain Code"],
        resources: [{ label: "Video: Motor Wiring Diagram", url: "#" }, { label: "Video: Pairing Controller ", url: "#"}, { label: "Video: Github Repo", url: "#"} ]
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
        desc: "Modify code to incorporate new motor. Determine stopping limits to minimize motor wear.",
        color: "#FF3D00", 
        tasks: ["Update Code"],
        resources: [{ label: "Video: Motor Limits", url: "#" }]
    },
    { 
        phase: 6,
        title: "Stage 4", 
        subtitle: "Top Lift Motor & Misc.",
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
    },    { 
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
    isMobile = canvas.width < 768;
    drawRoadmap();
}

function drawRoadmap() {
    const width = canvas.width;
    const height = canvas.height;
    
    // Config for the wave
    const padding = isMobile ? 60 : 150; 
    const amplitude = isMobile ? 80 : 120; 
    
    ctx.clearRect(0, 0, width, height);

    // -- CALCULATE PATH POINTS --
    const points = [];
    const steps = 300; 

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Sine wave formula
        const startX = padding;
        const endX = width - padding;
        const x = startX + t * (endX - startX);
        const y = (height / 2) + Math.sin(t * Math.PI * (checkpoints.length - 1)) * amplitude;
        
        points.push({x, y});
    }

    // 1. Draw Decor (Corners)
    drawCornerDecors(width, height);

    // 2. Draw Cards (Behind road)
    calculateNodePositions(width, height, padding, amplitude);
    nodePositions.forEach((node, index) => {
        drawCard(node, index);
    });

    // 3. Draw Road
    ctx.lineCap = 'round';
    
    // Outer Border
    ctx.beginPath();
    ctx.lineWidth = THEME.road.widthOuter; 
    ctx.strokeStyle = THEME.road.outerColor; 
    drawPath(points);
    ctx.stroke();

    // Inner Asphalt
    ctx.beginPath();
    ctx.lineWidth = THEME.road.widthInner;
    ctx.strokeStyle = THEME.road.innerColor; 
    drawPath(points);
    ctx.stroke();

    // Center Dashes
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = THEME.road.dashColor;
    ctx.setLineDash([10, 15]);
    drawPath(points);
    ctx.stroke();
    ctx.setLineDash([]); 

    // 4. Draw Nodes (Top layer)
    nodePositions.forEach((node, index) => {
        drawNode(node, index);
    });
}

function calculateNodePositions(width, height, padding, amplitude) {
    nodePositions = []; 
    const totalPoints = checkpoints.length;

    checkpoints.forEach((point, index) => {
        const t = index / (totalPoints - 1);
        const startX = padding;
        const endX = width - padding;
        const x = startX + t * (endX - startX);
        const y = (height / 2) + Math.sin(t * Math.PI * (totalPoints - 1)) * amplitude;

        const isHovered = (index === hoveredIndex);
        const radius = isHovered ? 28 : 22; 

        nodePositions.push({ x, y, data: point, radius: radius });
    });
}

function drawPath(points) {
    if(points.length === 0) return;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
}

function drawCard(node, index) {
    const isUp = (index % 2 !== 0); 
    const { width, height, radius, shadow } = THEME.card;
    const stemLength = 60;
    
    const x = node.x - (width / 2);
    let y = isUp ? (node.y - stemLength - height) : (node.y + stemLength);

    // 1. Draw Shadow & Card Shape
    ctx.save();
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = node.data.color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.restore();

    // 2. Draw Connector Stem
    ctx.beginPath();
    ctx.lineWidth = 40; 
    ctx.strokeStyle = node.data.color;
    
    if (isUp) {
        ctx.moveTo(node.x, y + height - 10);
        ctx.lineTo(node.x, node.y);
    } else {
        ctx.moveTo(node.x, y + 10);
        ctx.lineTo(node.x, node.y);
    }
    ctx.stroke();

    // 3. Draw Text Content
    ctx.fillStyle = "#fff";
    
    // --- FIX: Explicitly reset text alignment settings ---
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic"; // Resets the "middle" setting from drawNode
    // ----------------------------------------------------

    // Title
    ctx.font = THEME.font.cardTitle;
    ctx.fillText(node.data.title, x + 20, y + 35);
    
    // Divider Line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.moveTo(x + 20, y + 50);
    ctx.lineTo(x + width - 20, y + 50);
    ctx.stroke();

    // Description
    ctx.font = THEME.font.cardDesc;
    wrapText(ctx, node.data.desc, x + 20, y + 75, width - 40, 18);
}

function drawNode(node, index) {
    const isHovered = (index === hoveredIndex);

    // Node layers
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#e0e0e0";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Number
    ctx.fillStyle = node.data.color; 
    ctx.font = isHovered ? THEME.font.nodeNumHover : THEME.font.nodeNum;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(index + 1, node.x, node.y + 2);
}

function drawCornerDecors(w, h) {
    const size = 150;
    
    // Top Left (Green)
    ctx.save();
    ctx.translate(0, 0);
    ctx.fillStyle = "#00C853";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.fill();
    ctx.restore();

    // Top Right (Red)
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1); 
    ctx.fillStyle = "#FF3D00";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.fill();
    ctx.restore();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

// ==========================================
// 4. INTERACTION
// ==========================================

function closePopup() {
    if(popup) popup.style.display = 'none';
}
if (closeBtn) closeBtn.addEventListener('click', closePopup);

canvas.addEventListener('click', (e) => {
    if (hoveredIndex !== -1) {
        showPopup(nodePositions[hoveredIndex]);
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
        if (dist < 40) { 
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
    const taskList = node.data.tasks.map(task => `<li>${task}</li>`).join('');
    const resourceList = node.data.resources.map(res => 
        `<a href="${res.url}" class="resource-link" target="_blank">${res.label}</a>`
    ).join('');

    // CLEAN HTML: No inline styles
    popupContent.innerHTML = `
        <h3>${node.data.title}: ${node.data.subtitle}</h3>
        <p>${node.data.desc}</p>
        <hr/>
        <h4>Tasks</h4>
        <ul>${taskList}</ul>
        <div class="resources-wrapper">
            ${resourceList}
        </div>
    `;
    
    // Dynamic Layout (Must remain in JS)
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.display = 'block';
    
    // Data-driven Color (Must remain in JS)
    popup.style.borderTopColor = node.data.color;
}

window.addEventListener('resize', resizeAndDraw);
resizeAndDraw();
export const checkpoints = [
    { 
        title: "Build 1", 
        subtitle: "Holonomic Drive",
        desc: "Build chassis frame, install motors, and attach mecanum wheels.",
        color: "#00C853", 
        tasks: ["Build chassis frame", "Install 4 motors", "Attach mecanum wheels","QC: Check wheel X pattern & frame squareness."],
        resources: [{ label: "Pages 4-23", url: "#" }]
    },
    { 
        title: "Planning", 
        subtitle: "Gantt Chart",
        desc: "Make a copy of the Gantt chart and assign tasks. Due April 1st.",
        color: "#7269be", 
        tasks: ["Complete Gantt Chart","Add link to Engineering Journal"],
        resources: [{ label: "Video: Gantt Chart", url: "#" }]
    },
    { 
        title: "Testing 1", 
        subtitle: "Drivetrain",
        desc: "Watch the videos for an introduction to various tests.",
        color: "#FF3D00", 
        tasks: ["Connect Brain and Battery","Pairing Controller","Sample Drivetrain Code"],
        resources: [{ label: "Wiring Diagram", url: "#" }, { label: "Pairing Controller ", url: "#"}, { label: "Github Repo", url: "#"} ]
    },
    { 
        title: "Research", 
        subtitle: "Compare Drivetrain Options",
        desc: "Experiment with the code sample and research the pros and cons of different drivetrain types. Due April 9th.",
        color: "#dfda48", 
        tasks: ["Complete comparison in Criterion A: Engineering Journal"],
        resources: [{ label: "Video: Gantt Chart", url: "#" }]
    },
    { 
        title: "Build 2", 
        subtitle: "Indexer & Tower Base",
        desc: "Assemble the lower motor gearbox and install the base of the conveyor tower.",
        color: "#00C853", 
        tasks: ["Build mechanism","Install"],
        resources: [{ label: "Pages 24-31", url: "#" }]
    },
    { 
        title: "Testing 2", 
        subtitle: "Code motor limits",
        desc: "Modify code to incorporate new motor. Determine stopping limits.",
        color: "#FF3D00", 
        tasks: ["Update Code"],
        resources: [{ label: "Video: Motor Limits", url: "#" }]
    },
    { 
        title: "Build 3", 
        subtitle: "Top Lift Motor",
        desc: "Assemble chains for drivetrain. Install the top lift motor.",
        color: "#00C853", 
        tasks: ["Assemble drivetrain chains", "Mount top lift motor"],
        resources: [{ label: "Pages 32-49", url: "#" }]
    },
    { 
        title: "Build 4", 
        subtitle: "Intake Arms & Paddles",
        desc: "Construct the fold-out intake arms and attach the intake flap chains.",
        color: "#00C853", 
        tasks: ["Assemble chains", "Mount intake"],
        resources: [{ label: "Pages 50-66", url: "#" }]
    },
    { 
        title: "Testing 3", 
        subtitle: "Box Fit",
        desc: "Without power, test the mechanism with boxes.",
        color: "#FF3D00", 
        tasks: ["Complete test"],
        resources: [{ label: "None", url: "#" }]
    },
    { 
        title: "Build 5", 
        subtitle: "Finalize Assembly",
        desc: "Final cable management, battery checks, and driver practice. Deadline May 1st.",
        color: "#00C853", 
        tasks: ["Cable management", "Final assembly","Install tensioning rubber bands"],
        resources: [{ label: "Pages 66-71", url: "#" }]
    }
    ,
    { 
        title: "Testing 4", 
        subtitle: "Driver Practice",
        desc: "Update code with any final tweaks and practice driving the robot.",
        color: "#FF3D00", 
        tasks: ["Update code", "Practice driving","Autonomous"],
        resources: [{ label: "Pages 66-71", url: "#" }]
    }
];
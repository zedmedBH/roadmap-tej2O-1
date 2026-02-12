export const checkpoints = [
    { 
        phase: 1,
        title: "Build 1", 
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
        desc: "Make a copy of the Gantt chart and assign tasks. Due April 1st.",
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
        title: "Build 2", 
        subtitle: "Indexer & Tower Base",
        desc: "Assemble the lower motor gearbox and install the base of the conveyor tower.",
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
        title: "Build 3", 
        subtitle: "Top Lift Motor",
        desc: "Assemble chains for drivetrain. Install the top lift motor.",
        color: "#00C853", 
        tasks: ["Assemble drivetrain chains", "Mount top lift motor"],
        resources: [{ label: "Pages 32-49", url: "#" }]
    },
    { 
        phase: 7,
        title: "Build 4", 
        subtitle: "Intake Arms & Paddles",
        desc: "Construct the fold-out intake arms and attach the intake flap chains.",
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
        title: "Build 5", 
        subtitle: "Finalize Assembly",
        desc: "Final cable management, battery checks, and driver practice. Deadline May 1st.",
        color: "#00C853", 
        tasks: ["Cable management", "Final assembly","Install tensioning rubber bands"],
        resources: [{ label: "Pages 66-71", url: "#" }]
    }
];
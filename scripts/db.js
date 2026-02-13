// scripts/db.js
import { db } from './firebase-config.js';
import { 
    collection, doc, getDoc, getDocs, setDoc, addDoc, 
    query, where, updateDoc, arrayUnion, arrayRemove, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- TASKS (Checkpoints) ---
// We fetch "master tasks" created by the teacher
export async function getMasterTasks() {
    const q = query(collection(db, "masterTasks")); // We will order by index manually later
    const snapshot = await getDocs(q);
    const tasks = [];
    snapshot.forEach(doc => tasks.push({ id: doc.id, ...doc.data() }));
    return tasks.sort((a, b) => a.orderIndex - b.orderIndex);
}

// Seed the DB if empty (run this once)
export async function seedMasterTasks(checkpointsData) {
    const snapshot = await getDocs(collection(db, "masterTasks"));
    if (snapshot.empty) {
        console.log("Seeding Database...");
        checkpointsData.forEach(async (task, index) => {
            await addDoc(collection(db, "masterTasks"), { ...task, orderIndex: index });
        });
    }
}

// --- TEAMS & USERS ---

// Get User Profile (including their teamId)
export async function getUserProfile(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

// Create/Update basic user record on login
export async function syncUser(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'student', // default
            teamId: null
        });
        return { role: 'student', teamId: null };
    }
    return snap.data();
}

// Admin: Create Team
export async function createTeam(teamName) {
    const docRef = await addDoc(collection(db, "teams"), {
        name: teamName,
        members: [] // Array of emails or UIDs
    });
    return docRef.id;
}

// Admin: Get All Teams
export async function getAllTeams() {
    const snap = await getDocs(collection(db, "teams"));
    const teams = [];
    snap.forEach(doc => teams.push({ id: doc.id, ...doc.data() }));
    return teams;
}

// Admin: Add Student to Team by Email
export async function addStudentToTeam(teamId, studentEmail) {
    // 1. Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", studentEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Student must log in at least once before being added.");
    }

    let uid;
    querySnapshot.forEach(doc => { uid = doc.id; });

    // 2. Update User's teamId
    await updateDoc(doc(db, "users", uid), { teamId: teamId });

    // 3. Add to Team's member list (UI convenience)
    await updateDoc(doc(db, "teams", teamId), {
        members: arrayUnion({ email: studentEmail, uid: uid })
    });
}

// Get Team Members (for dropdowns)
export async function getTeamMembers(teamId) {
    const teamRef = doc(db, "teams", teamId);
    const snap = await getDoc(teamRef);
    return snap.exists() ? snap.data().members : [];
}

// --- PROGRESS TRACKING ---

// Save Progress (Gantt Data)
export async function saveTaskProgress(teamId, taskId, data) {
    // ID format: teamId_taskId to ensure uniqueness per team per task
    const docId = `${teamId}_${taskId}`;
    await setDoc(doc(db, "teamProgress", docId), {
        teamId,
        taskId,
        ...data, // assignee, dueDate, status
        lastUpdated: new Date()
    }, { merge: true });
}

// Get Team's Progress
export async function getTeamProgress(teamId) {
    const q = query(collection(db, "teamProgress"), where("teamId", "==", teamId));
    const snapshot = await getDocs(q);
    const progress = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        progress[data.taskId] = data;
    });
    return progress;
}

export async function removeStudentFromTeam(teamId, memberObject) {
    // A. Remove the specific object {email, uid} from the Team's array
    const teamRef = doc(db, "teams", teamId);
    await updateDoc(teamRef, {
        members: arrayRemove(memberObject)
    });

    // B. Reset the Student's profile (set teamId to null)
    const userRef = doc(db, "users", memberObject.uid);
    await updateDoc(userRef, {
        teamId: null
    });
}

export async function deleteTeam(teamId) {
    // 1. Get all members of this team first
    const members = await getTeamMembers(teamId);

    // 2. Unassign all students (Set their teamId to null)
    const unassignPromises = members.map(m => {
        const userRef = doc(db, "users", m.uid);
        return updateDoc(userRef, { teamId: null });
    });
    await Promise.all(unassignPromises);

    // 3. Delete the Team Document
    await deleteDoc(doc(db, "teams", teamId));
}
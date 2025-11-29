import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    serverTimestamp, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const vehicleList = document.getElementById('vehicle-list');
const fabAdd = document.getElementById('fab-add');
const addModal = document.getElementById('add-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelAddBtn = document.getElementById('cancel-add');
const addVehicleForm = document.getElementById('add-vehicle-form');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

let currentUser = null;
let unsubscribeVehicles = null;

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userNameEl.textContent = user.displayName || 'User';
        userEmailEl.textContent = user.email;
        loadVehicles(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed', error);
    }
});

// Load Vehicles (Real-time)
function loadVehicles(userId) {
    const q = query(
        collection(db, "vehicles"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    unsubscribeVehicles = onSnapshot(q, (snapshot) => {
        vehicleList.innerHTML = '';
        
        if (snapshot.empty) {
            vehicleList.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-car empty-icon"></i>
                    <h3>No vehicles added yet</h3>
                    <p style="color: var(--text-light); margin-bottom: 1.5rem;">Add your first vehicle to get started with inspections</p>
                    <button onclick="document.getElementById('add-modal').classList.add('active')" class="btn btn-primary">Add Vehicle</button>
                </div>
            `;
            return;
        }

        snapshot.forEach((doc) => {
            const vehicle = doc.data();
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.innerHTML = `
                <div class="vehicle-card-header">
                    <div>
                        <div class="vehicle-name">${vehicle.vehicleName}</div>
                        <span class="vehicle-plate">${vehicle.licensePlate}</span>
                    </div>
                    <button class="btn-delete" data-id="${doc.id}" title="Delete Vehicle">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div style="margin-top: 1.5rem;">
                    <a href="form.html?vehicleId=${doc.id}&name=${encodeURIComponent(vehicle.vehicleName)}&plate=${encodeURIComponent(vehicle.licensePlate)}" class="btn btn-primary btn-full" style="padding: 0.5rem;">
                        View Details
                    </a>
                </div>
            `;
            vehicleList.appendChild(card);
        });

        // Attach delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteVehicle(e.currentTarget.dataset.id));
        });
    }, (error) => {
        console.error("Error fetching vehicles: ", error);
        // If index is missing, Firestore will throw an error. 
        // For simple queries without composite indexes, this usually works fine.
        // If sorting by createdAt fails due to missing index, try removing orderBy.
        if (error.code === 'failed-precondition') {
             console.warn("Index required. Falling back to unsorted query.");
             // Fallback logic could go here if needed
        }
    });
}

// Add Vehicle Modal Logic
function openModal() { addModal.classList.add('active'); }
function closeModal() { 
    addModal.classList.remove('active'); 
    addVehicleForm.reset();
}

fabAdd.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelAddBtn.addEventListener('click', closeModal);

// Close on outside click
addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeModal();
});

// Add Vehicle Form Submit
addVehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('vehicle-name').value;
    const plate = document.getElementById('license-plate').value.toUpperCase();
    const btn = addVehicleForm.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.textContent = 'Adding...';
    
    try {
        await addDoc(collection(db, "vehicles"), {
            userId: currentUser.uid,
            vehicleName: name,
            licensePlate: plate,
            createdAt: serverTimestamp()
        });
        
        showToast('Vehicle added successfully!', 'success');
        closeModal();
    } catch (error) {
        console.error("Error adding vehicle: ", error);
        showToast('Failed to add vehicle', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add Vehicle';
    }
});

// Delete Vehicle
async function deleteVehicle(vehicleId) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        try {
            await deleteDoc(doc(db, "vehicles", vehicleId));
            showToast('Vehicle deleted', 'success');
        } catch (error) {
            console.error("Error deleting vehicle: ", error);
            showToast('Failed to delete vehicle', 'error');
        }
    }
}

// Toast Helper
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    toast.querySelector('i').className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

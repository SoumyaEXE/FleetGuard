'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from "firebase/auth";
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
} from "firebase/firestore";
import { auth, db } from '../../lib/firebase';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', plate: '' });
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load vehicles
        // Note: Client-side sorting used to avoid creating a composite index for now.
        // For production with large datasets, create the index and use orderBy("createdAt", "desc") in the query.
        const q = query(
          collection(db, "vehicles"), 
          where("userId", "==", currentUser.uid)
        );

        const unsubscribeVehicles = onSnapshot(q, (snapshot) => {
          const vehicleData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => {
            // Sort by createdAt desc
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          setVehicles(vehicleData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching vehicles: ", error);
          setLoading(false);
        });

        return () => unsubscribeVehicles();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      await addDoc(collection(db, "vehicles"), {
        userId: user.uid,
        vehicleName: newVehicle.name,
        licensePlate: newVehicle.plate.toUpperCase(),
        createdAt: serverTimestamp()
      });
      
      showToastMessage('Vehicle added successfully!', 'success');
      setShowModal(false);
      setNewVehicle({ name: '', plate: '' });
    } catch (error) {
      console.error("Error adding vehicle: ", error);
      showToastMessage('Failed to add vehicle', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteDoc(doc(db, "vehicles", vehicleId));
        showToastMessage('Vehicle deleted successfully', 'success');
      } catch (error) {
        console.error("Error deleting vehicle: ", error);
        showToastMessage('Failed to delete vehicle', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="logo" style={{ fontSize: '1.2rem' }}>
          <i className="fa-solid fa-truck-fast"></i> FLEETGUARD
        </div>
        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{user?.displayName || 'User'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>My Vehicles</h2>
        </div>

        <div className="vehicle-grid">
          {vehicles.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fa-solid fa-car empty-icon"></i>
              <h3>No vehicles added yet</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Add your first vehicle to get started with inspections</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Vehicle</button>
            </div>
          ) : (
            vehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-card-header">
                  <div>
                    <div className="vehicle-name">{vehicle.vehicleName}</div>
                    <span className="vehicle-plate">{vehicle.licensePlate}</span>
                  </div>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    title="Delete Vehicle"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
                
                {vehicle.lastHealthScore && (
                  <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: vehicle.lastHealthScore >= 80 ? '#dcfce7' : vehicle.lastHealthScore >= 50 ? '#fef3c7' : '#fee2e2',
                      color: vehicle.lastHealthScore >= 80 ? '#166534' : vehicle.lastHealthScore >= 50 ? '#d97706' : '#991b1b',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {vehicle.lastHealthScore}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      Last Health Score
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                  <Link 
                    href={`/vehicle/${vehicle.id}?name=${encodeURIComponent(vehicle.vehicleName)}&plate=${encodeURIComponent(vehicle.licensePlate)}`} 
                    className="btn btn-primary btn-full" 
                    style={{ padding: '0.5rem', textAlign: 'center', display: 'block' }}
                  >
                    {vehicle.lastInspectionId ? 'New Inspection' : 'Start Inspection'}
                  </Link>
                  
                  {vehicle.lastInspectionId && (
                    <Link 
                      href={`/analysis/${vehicle.lastInspectionId}`}
                      className="btn btn-secondary btn-full"
                      style={{ padding: '0.5rem', textAlign: 'center', display: 'block', background: 'transparent', border: '1px solid var(--text-light)', color: 'var(--text-main)' }}
                    >
                      View Last Report
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Vehicle FAB */}
      <button onClick={() => setShowModal(true)} className="fab-add">
        <i className="fa-solid fa-plus"></i>
      </button>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={(e) => e.target.className.includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add New Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="btn-close"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <form onSubmit={handleAddVehicle}>
              <div className="form-group">
                <label htmlFor="vehicle-name">Vehicle Name</label>
                <input 
                  type="text" 
                  id="vehicle-name" 
                  className="form-input" 
                  placeholder="e.g., Honda Civic 2020" 
                  required 
                  minLength="2" 
                  maxLength="50"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="license-plate">License Plate Number</label>
                <input 
                  type="text" 
                  id="license-plate" 
                  className="form-input" 
                  placeholder="e.g., DL01AB1234" 
                  required 
                  minLength="4" 
                  maxLength="15" 
                  style={{ textTransform: 'uppercase' }}
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.show ? 'show' : ''}`} style={{ display: 'flex', opacity: 1, transform: 'translateY(0)' }}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

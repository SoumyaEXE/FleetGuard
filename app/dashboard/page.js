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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, healthy, warning, critical
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const q = query(
          collection(db, "vehicles"), 
          where("userId", "==", currentUser.uid)
        );

        const unsubscribeVehicles = onSnapshot(q, (snapshot) => {
          const vehicleData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => {
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

  // Computed Stats
  const stats = {
    total: vehicles.length,
    avgHealth: vehicles.length > 0 
      ? Math.round(vehicles.reduce((acc, v) => acc + (v.lastHealthScore || 0), 0) / vehicles.length) 
      : 0,
    critical: vehicles.filter(v => (v.lastHealthScore || 100) < 50).length,
    warning: vehicles.filter(v => (v.lastHealthScore || 100) >= 50 && (v.lastHealthScore || 100) < 80).length
  };

  // Filtered Vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const score = vehicle.lastHealthScore || 100;
    if (filterStatus === 'healthy') return score >= 80;
    if (filterStatus === 'warning') return score >= 50 && score < 80;
    if (filterStatus === 'critical') return score < 50;
    
    return true;
  });

  const getHealthColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Attention';
    return 'Critical';
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
            <span className="user-name">{user?.displayName || 'Fleet Manager'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-container">
        
        {/* Welcome & Stats Section */}
        <div className="dashboard-welcome">
          <div>
            <h1>Dashboard</h1>
            <p className="text-light">Welcome back, here's what's happening with your fleet today.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary desktop-add-btn">
            <i className="fa-solid fa-plus"></i> Add Vehicle
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <i className="fa-solid fa-truck"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vehicles</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Avg. Fleet Health</span>
              <span className="stat-value">{stats.avgHealth}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">Critical Issues</span>
              <span className="stat-value">{stats.critical}</span>
            </div>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="controls-row">
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-wrapper">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Needs Attention</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="vehicle-grid">
          {filteredVehicles.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <i className="fa-solid fa-car empty-icon"></i>
              <h3>No vehicles found</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                {vehicles.length === 0 ? "Add your first vehicle to get started." : "Try adjusting your search or filters."}
              </p>
              {vehicles.length === 0 && (
                <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Vehicle</button>
              )}
            </div>
          ) : (
            filteredVehicles.map(vehicle => {
              const score = vehicle.lastHealthScore || 0;
              const healthColor = getHealthColor(score);
              
              return (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-card-header">
                    <div className="vehicle-identity">
                      <div className="vehicle-icon">
                        <i className="fa-solid fa-car-side"></i>
                      </div>
                      <div>
                        <div className="vehicle-name">{vehicle.vehicleName}</div>
                        <span className="vehicle-plate">{vehicle.licensePlate}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-icon-only" 
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        title="Delete Vehicle"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="health-status-section">
                    <div className="health-header">
                      <span className="health-label">Health Score</span>
                      <span className="health-score" style={{ color: healthColor }}>{score}/100</span>
                    </div>
                    <div className="health-bar-bg">
                      <div 
                        className="health-bar-fill" 
                        style={{ width: `${score}%`, backgroundColor: healthColor }}
                      ></div>
                    </div>
                    <div className="status-badge" style={{ 
                      backgroundColor: `${healthColor}20`, 
                      color: healthColor,
                      marginTop: '0.5rem'
                    }}>
                      <i className={`fa-solid ${score >= 80 ? 'fa-check-circle' : score >= 50 ? 'fa-exclamation-circle' : 'fa-circle-xmark'}`}></i>
                      {getHealthLabel(score)}
                    </div>
                  </div>

                  <div className="card-footer">
                    <Link 
                      href={`/vehicle/${vehicle.id}?name=${encodeURIComponent(vehicle.vehicleName)}&plate=${encodeURIComponent(vehicle.licensePlate)}`} 
                      className="btn btn-primary btn-full" 
                    >
                      {vehicle.lastInspectionId ? 'New Inspection' : 'Start Inspection'}
                    </Link>
                    
                    {vehicle.lastInspectionId && (
                      <Link 
                        href={`/analysis/${vehicle.lastInspectionId}`}
                        className="btn btn-outline btn-full"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Vehicle FAB (Mobile Only) */}
      <button onClick={() => setShowModal(true)} className="fab-add mobile-only">
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

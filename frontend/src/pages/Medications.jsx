import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import MedicationCard from '../components/MedicationCard';
import MedicationForm from '../components/MedicationForm';
import './Medications.css';

export default function Medications() {
    const toast = useToast();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMed, setEditingMed] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchMedications = useCallback(async () => {
        try {
            const { data } = await api.getMedications();
            setMedications(data);
        } catch (error) {
            toast.error('Failed to load medications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedications();
    }, [fetchMedications]);

    const handleAdd = async (data) => {
        try {
            await api.createMedication(data);
            toast.success('Medication added!');
            setShowForm(false);
            await fetchMedications();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = async (data) => {
        try {
            await api.updateMedication(editingMed._id, data);
            toast.success('Medication updated!');
            setEditingMed(null);
            await fetchMedications();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this medication?')) return;
        try {
            await api.deleteMedication(id);
            toast.success('Medication deleted');
            await fetchMedications();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filtered = medications.filter((m) => {
        if (filter === 'active') return m.active;
        if (filter === 'low-stock') return m.active && m.totalStock > 0 && (m.remainingStock / m.totalStock) <= 0.2;
        return true;
    });

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p className="text-muted">Loading medications...</p>
            </div>
        );
    }

    return (
        <div className="medications-page">
            <div className="section-header">
                <h1 className="heading-2">Medications</h1>
                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(true)}>
                    + Add New
                </button>
            </div>

            {/* Filters */}
            <div className="tabs">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'active', label: 'Active' },
                    { key: 'low-stock', label: '⚠️ Low Stock' },
                ].map((f) => (
                    <button
                        key={f.key}
                        className={`tab ${filter === f.key ? 'tab--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Medication List */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">💊</div>
                    <p className="empty-state__title">No medications found</p>
                    <p className="empty-state__text">
                        {filter === 'all'
                            ? 'Add your first medication to get started'
                            : 'No medications match this filter'}
                    </p>
                </div>
            ) : (
                <div className="medications-list">
                    {filtered.map((med) => (
                        <MedicationCard
                            key={med._id}
                            medication={med}
                            onEdit={(m) => setEditingMed(m)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="heading-3">Add Medication</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <MedicationForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingMed && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingMed(null)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="heading-3">Edit Medication</h2>
                            <button className="modal-close" onClick={() => setEditingMed(null)}>✕</button>
                        </div>
                        <MedicationForm
                            medication={editingMed}
                            onSubmit={handleEdit}
                            onCancel={() => setEditingMed(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

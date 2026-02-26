import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ScheduleTimeline from '../components/ScheduleTimeline';
import MedicationForm from '../components/MedicationForm';
import './Home.css';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export default function Home() {
    const { user } = useAuth();
    const toast = useToast();
    const [schedule, setSchedule] = useState([]);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [takingDose, setTakingDose] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [schedRes, medRes] = await Promise.all([
                api.getTodaySchedule(),
                api.getMedications(),
            ]);
            setSchedule(schedRes.data);
            setMedications(medRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTakeDose = async (dose) => {
        setTakingDose(true);
        try {
            await api.takeDose({
                medicationId: dose.medicationId || dose.medication?._id,
                scheduledTime: dose.scheduledTime,
                date: dose.date,
            });
            toast.success('Dose marked as taken! 💊');
            await fetchData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setTakingDose(false);
        }
    };

    const handleAddMedication = async (data) => {
        try {
            await api.createMedication(data);
            toast.success('Medication added! 🎉');
            setShowAddForm(false);
            await fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Summary stats
    const totalToday = schedule.length;
    const takenCount = schedule.filter((d) => d.status === 'taken').length;
    const missedCount = schedule.filter((d) => d.status === 'missed').length;
    const upcomingCount = schedule.filter((d) => d.status === 'upcoming').length;
    const lowStockMeds = medications.filter(
        (m) => m.active && m.totalStock > 0 && (m.remainingStock / m.totalStock) <= 0.2
    );

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p className="text-muted">Loading your schedule...</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Greeting */}
            <div className="home-greeting">
                <h1 className="heading-2">
                    {getGreeting()}, <span className="home-greeting__name">{user?.name?.split(' ')[0] || 'there'}</span>
                </h1>
                <p className="text-muted">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {/* Stats cards */}
            <div className="home-stats">
                <div className="home-stat glass-card">
                    <span className="home-stat__value home-stat__value--primary">{totalToday}</span>
                    <span className="home-stat__label">Total</span>
                </div>
                <div className="home-stat glass-card">
                    <span className="home-stat__value home-stat__value--success">{takenCount}</span>
                    <span className="home-stat__label">Taken</span>
                </div>
                <div className="home-stat glass-card">
                    <span className="home-stat__value home-stat__value--danger">{missedCount}</span>
                    <span className="home-stat__label">Missed</span>
                </div>
                <div className="home-stat glass-card">
                    <span className="home-stat__value home-stat__value--info">{upcomingCount}</span>
                    <span className="home-stat__label">Upcoming</span>
                </div>
            </div>

            {/* Low stock alerts */}
            {lowStockMeds.length > 0 && (
                <div className="home-alerts">
                    {lowStockMeds.map((med) => (
                        <div key={med._id} className="home-alert glass-card">
                            <span className="home-alert__icon">⚠️</span>
                            <div>
                                <p className="home-alert__title">Low stock: {med.name}</p>
                                <p className="home-alert__text">
                                    Only {med.remainingStock} {med.remainingStock === 1 ? 'dose' : 'doses'} remaining
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add medication button */}
            <div className="section-header mt-6">
                <h2 className="section-title">Today's Schedule</h2>
                <button className="btn btn--primary btn--sm" onClick={() => setShowAddForm(true)}>
                    + Add Med
                </button>
            </div>

            {/* Schedule timeline */}
            <ScheduleTimeline
                schedule={schedule}
                onTakeDose={handleTakeDose}
                loading={takingDose}
            />

            {/* Add medication modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="heading-3">Add Medication</h2>
                            <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
                        </div>
                        <MedicationForm
                            onSubmit={handleAddMedication}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

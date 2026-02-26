import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import notificationService from '../services/notifications';
import './Profile.css';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({
        name: '',
        age: '',
        phone: '',
        bloodGroup: '',
        emergencyContact: '',
        emergencyContactName: '',
        medicalConditions: '',
        notificationsEnabled: true,
    });
    const [saving, setSaving] = useState(false);
    const [notifStatus, setNotifStatus] = useState('unknown');
    const [newCondition, setNewCondition] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                age: user.age || '',
                phone: user.phone || '',
                bloodGroup: user.bloodGroup || '',
                emergencyContact: user.emergencyContact || '',
                emergencyContactName: user.emergencyContactName || '',
                medicalConditions: '',
                notificationsEnabled: user.notificationsEnabled ?? true,
            });
        }

        // Check notification status
        if (notificationService.isSupported()) {
            setNotifStatus(Notification.permission);
        } else {
            setNotifStatus('unsupported');
        }
    }, [user]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                name: form.name,
                age: form.age ? Number(form.age) : undefined,
                phone: form.phone,
                bloodGroup: form.bloodGroup,
                emergencyContact: form.emergencyContact,
                emergencyContactName: form.emergencyContactName,
                notificationsEnabled: form.notificationsEnabled,
            };

            const { data } = await api.updateProfile(updateData);
            updateUser(data);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddCondition = async () => {
        if (!newCondition.trim()) return;
        try {
            const conditions = [...(user.medicalConditions || []), newCondition.trim()];
            await api.updateProfile({ medicalConditions: conditions });
            updateUser({ medicalConditions: conditions });
            setNewCondition('');
            toast.success('Condition added');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleRemoveCondition = async (index) => {
        try {
            const conditions = (user.medicalConditions || []).filter((_, i) => i !== index);
            await api.updateProfile({ medicalConditions: conditions });
            updateUser({ medicalConditions: conditions });
            toast.success('Condition removed');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleToggleNotifications = async () => {
        const newValue = !form.notificationsEnabled;
        handleChange('notificationsEnabled', newValue);

        if (newValue) {
            const subscribed = await notificationService.subscribe();
            if (subscribed) {
                toast.success('Notifications enabled');
            } else {
                toast.info('Notification permission needed. Check browser settings.');
            }
        } else {
            await notificationService.unsubscribe();
            toast.info('Notifications disabled');
        }
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    };

    return (
        <div className="profile-page">
            <h1 className="heading-2 mb-6">Profile & Settings</h1>

            {/* Avatar / user info */}
            <div className="profile-avatar glass-card">
                <div className="profile-avatar__circle">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                    <h2 className="profile-avatar__name">{user?.name}</h2>
                    <p className="text-small text-muted">{user?.email}</p>
                </div>
            </div>

            {/* Personal Details */}
            <section className="profile-section">
                <h3 className="profile-section__title">Personal Details</h3>
                <div className="glass-card">
                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-name">Full Name</label>
                        <input
                            id="profile-name"
                            className="form-input"
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div className="profile-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-age">Age</label>
                            <input
                                id="profile-age"
                                className="form-input"
                                type="number"
                                min="0"
                                max="150"
                                value={form.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-blood">Blood Group</label>
                            <select
                                id="profile-blood"
                                className="form-input form-select"
                                value={form.bloodGroup}
                                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                            >
                                <option value="">Select</option>
                                {BLOOD_GROUPS.filter(Boolean).map((bg) => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                        <input
                            id="profile-phone"
                            className="form-input"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section className="profile-section">
                <h3 className="profile-section__title">Emergency Contact</h3>
                <div className="glass-card">
                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-ec-name">Contact Name</label>
                        <input
                            id="profile-ec-name"
                            className="form-input"
                            type="text"
                            value={form.emergencyContactName}
                            onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                            placeholder="e.g., Dr. Smith, Family Member"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-ec-phone">Contact Number</label>
                        <input
                            id="profile-ec-phone"
                            className="form-input"
                            type="tel"
                            value={form.emergencyContact}
                            onChange={(e) => handleChange('emergencyContact', e.target.value)}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>
            </section>

            {/* Medical Conditions */}
            <section className="profile-section">
                <h3 className="profile-section__title">Medical Conditions</h3>
                <div className="glass-card">
                    <div className="profile-conditions">
                        {(user?.medicalConditions || []).map((condition, index) => (
                            <span key={index} className="profile-condition-tag">
                                {condition}
                                <button
                                    className="profile-condition-remove"
                                    onClick={() => handleRemoveCondition(index)}
                                    aria-label={`Remove ${condition}`}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="profile-add-condition">
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Add condition (e.g., Diabetes)"
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                        />
                        <button className="btn btn--ghost btn--sm" onClick={handleAddCondition}>
                            Add
                        </button>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="profile-section">
                <h3 className="profile-section__title">Notifications</h3>
                <div className="glass-card">
                    <div className="profile-toggle">
                        <div>
                            <p className="profile-toggle__label">Medicine Reminders</p>
                            <p className="text-small text-muted">
                                {notifStatus === 'unsupported'
                                    ? 'Push notifications not supported on this device'
                                    : 'Receive reminders for scheduled medications'}
                            </p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={form.notificationsEnabled}
                                onChange={handleToggleNotifications}
                                disabled={notifStatus === 'unsupported'}
                            />
                            <span className="toggle__slider" />
                        </label>
                    </div>
                    {notifStatus === 'denied' && (
                        <p className="text-small" style={{ color: 'var(--color-warning-light)', marginTop: 'var(--space-2)' }}>
                            ⚠️ Notifications are blocked. Please enable them in your browser settings.
                        </p>
                    )}
                </div>
            </section>

            {/* Save button */}
            <button
                className="btn btn--primary btn--lg btn--block mt-6"
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? <span className="spinner spinner--sm" /> : 'Save Changes'}
            </button>

            {/* Logout */}
            <button className="btn btn--ghost btn--block mt-4 profile-logout" onClick={handleLogout}>
                Log Out
            </button>
        </div>
    );
}

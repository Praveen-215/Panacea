import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Emergency.css';

export default function Emergency() {
    const { user } = useAuth();
    const [emergencyInfo, setEmergencyInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmergency = async () => {
            try {
                const { data } = await api.getEmergencyInfo();
                setEmergencyInfo(data);
            } catch {
                // Fallback to local user data
                setEmergencyInfo({
                    userName: user?.name,
                    userAge: user?.age,
                    bloodGroup: user?.bloodGroup,
                    medicalConditions: user?.medicalConditions || [],
                    emergencyContact: user?.emergencyContact,
                    emergencyContactName: user?.emergencyContactName,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEmergency();
    }, [user]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
            </div>
        );
    }

    const hasContact = emergencyInfo?.emergencyContact;

    return (
        <div className="emergency-page">
            {/* Emergency header */}
            <div className="emergency-header">
                <div className="emergency-header__pulse" />
                <div className="emergency-header__icon">🆘</div>
                <h1 className="emergency-header__title">Emergency</h1>
                <p className="emergency-header__subtitle">Tap below to call for help</p>
            </div>

            {/* Call button */}
            {hasContact ? (
                <a
                    href={`tel:${emergencyInfo.emergencyContact}`}
                    className="emergency-call-btn"
                    aria-label={`Call ${emergencyInfo.emergencyContactName || 'emergency contact'}`}
                >
                    <span className="emergency-call-btn__icon">📞</span>
                    <span className="emergency-call-btn__text">
                        Call {emergencyInfo.emergencyContactName || 'Emergency Contact'}
                    </span>
                    <span className="emergency-call-btn__number">
                        {emergencyInfo.emergencyContact}
                    </span>
                </a>
            ) : (
                <div className="emergency-no-contact glass-card">
                    <p className="emergency-no-contact__text">
                        ⚠️ No emergency contact set up
                    </p>
                    <p className="text-small text-muted">
                        Go to Profile → Settings to add an emergency contact
                    </p>
                </div>
            )}

            {/* Call 112 (universal emergency number) */}
            <a href="tel:112" className="emergency-112-btn">
                <span>🚨</span>
                <span>Call Emergency Services (112)</span>
            </a>

            {/* User medical info */}
            <div className="emergency-info">
                <h2 className="emergency-info__title">Patient Information</h2>

                <div className="emergency-info__grid">
                    <div className="emergency-info__card glass-card">
                        <span className="emergency-info__label">Name</span>
                        <span className="emergency-info__value">
                            {emergencyInfo?.userName || 'Not set'}
                        </span>
                    </div>

                    <div className="emergency-info__card glass-card">
                        <span className="emergency-info__label">Age</span>
                        <span className="emergency-info__value emergency-info__value--large">
                            {emergencyInfo?.userAge || '—'}
                        </span>
                    </div>

                    <div className="emergency-info__card glass-card emergency-info__card--blood">
                        <span className="emergency-info__label">Blood Group</span>
                        <span className="emergency-info__value emergency-info__value--blood">
                            {emergencyInfo?.bloodGroup || 'Not set'}
                        </span>
                    </div>

                    <div className="emergency-info__card glass-card">
                        <span className="emergency-info__label">Emergency Contact</span>
                        <span className="emergency-info__value">
                            {emergencyInfo?.emergencyContactName || 'Not set'}
                        </span>
                    </div>
                </div>

                {/* Medical conditions */}
                {emergencyInfo?.medicalConditions?.length > 0 && (
                    <div className="emergency-conditions glass-card">
                        <h3 className="emergency-conditions__title">Known Medical Conditions</h3>
                        <div className="emergency-conditions__list">
                            {emergencyInfo.medicalConditions.map((condition, index) => (
                                <span key={index} className="emergency-conditions__tag">
                                    {condition}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

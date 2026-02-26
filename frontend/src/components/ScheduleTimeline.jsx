import './ScheduleTimeline.css';

function formatTime12(time24) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

const STATUS_CONFIG = {
    taken: { emoji: '✅', label: 'Taken', className: 'taken' },
    missed: { emoji: '❌', label: 'Missed', className: 'missed' },
    upcoming: { emoji: '🔔', label: 'Upcoming', className: 'upcoming' },
    skipped: { emoji: '⏭️', label: 'Skipped', className: 'missed' },
};

export default function ScheduleTimeline({ schedule, onTakeDose, loading }) {
    if (!schedule || schedule.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">📋</div>
                <p className="empty-state__title">No medications scheduled</p>
                <p className="empty-state__text">Add medications to see your daily schedule here</p>
            </div>
        );
    }

    return (
        <div className="timeline">
            {schedule.map((dose, index) => {
                const config = STATUS_CONFIG[dose.status] || STATUS_CONFIG.upcoming;
                const med = dose.medication;

                return (
                    <div key={`${dose.medicationId}-${dose.scheduledTime}-${index}`} className="timeline__item">
                        <div className="timeline__line">
                            <div className={`timeline__dot timeline__dot--${config.className}`}>
                                <span>{config.emoji}</span>
                            </div>
                            {index < schedule.length - 1 && <div className="timeline__connector" />}
                        </div>

                        <div className={`timeline__content glass-card timeline__content--${config.className}`}>
                            <div className="timeline__header">
                                <div>
                                    <h4 className="timeline__med-name">{med?.name || 'Unknown'}</h4>
                                    <p className="timeline__med-dosage">{med?.dosage}</p>
                                </div>
                                <div className="timeline__time">
                                    {formatTime12(dose.scheduledTime)}
                                </div>
                            </div>

                            <div className="timeline__footer">
                                <span className={`badge badge--${config.className}`}>
                                    {config.label}
                                </span>

                                {dose.status === 'upcoming' && (
                                    <button
                                        className="btn btn--success btn--sm"
                                        onClick={() => onTakeDose(dose)}
                                        disabled={loading}
                                    >
                                        {loading ? <span className="spinner spinner--sm" /> : '✓ Take Now'}
                                    </button>
                                )}

                                {dose.status === 'missed' && (
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => onTakeDose(dose)}
                                        disabled={loading}
                                    >
                                        Mark Taken
                                    </button>
                                )}
                            </div>

                            {med?.instructions && (
                                <p className="timeline__instructions">{med.instructions}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

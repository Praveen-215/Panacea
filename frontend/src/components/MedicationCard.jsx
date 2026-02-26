import './MedicationCard.css';

function formatTime12(time24) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function MedicationCard({ medication, onEdit, onDelete }) {
    const { name, dosage, timings, remainingStock, totalStock, instructions, active } = medication;
    const stockPercent = totalStock > 0 ? Math.round((remainingStock / totalStock) * 100) : 0;
    const isLow = stockPercent <= 20;
    const isMedium = stockPercent > 20 && stockPercent <= 50;

    return (
        <div className={`med-card glass-card ${!active ? 'med-card--inactive' : ''}`}>
            <div className="med-card__header">
                <div className="med-card__info">
                    <h3 className="med-card__name">{name}</h3>
                    <p className="med-card__dosage">{dosage}</p>
                </div>
                <div className="med-card__actions">
                    <button
                        className="med-card__action-btn"
                        onClick={() => onEdit(medication)}
                        aria-label="Edit medication"
                    >
                        ✏️
                    </button>
                    <button
                        className="med-card__action-btn med-card__action-btn--delete"
                        onClick={() => onDelete(medication._id)}
                        aria-label="Delete medication"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            <div className="med-card__timings">
                {timings.map((time) => (
                    <span key={time} className="med-card__time-chip">
                        🕐 {formatTime12(time)}
                    </span>
                ))}
            </div>

            {instructions && (
                <p className="med-card__instructions">📋 {instructions}</p>
            )}

            <div className="med-card__stock">
                <div className="med-card__stock-info">
                    <span className="text-small text-muted">Stock</span>
                    <span className={`text-small ${isLow ? 'med-card__stock-low' : ''}`}>
                        {remainingStock} / {totalStock}
                    </span>
                </div>
                <div className="stock-bar">
                    <div
                        className={`stock-bar__fill ${isLow ? 'stock-bar__fill--low' : isMedium ? 'stock-bar__fill--medium' : 'stock-bar__fill--high'
                            }`}
                        style={{ width: `${stockPercent}%` }}
                    />
                </div>
                {isLow && (
                    <div className="badge badge--warning mt-2">
                        ⚠️ Low stock — refill soon
                    </div>
                )}
            </div>
        </div>
    );
}

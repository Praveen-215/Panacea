import { useState } from 'react';
import './MedicationForm.css';

const DEFAULT_TIMINGS = ['08:00', '14:00', '20:00'];

export default function MedicationForm({ medication, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: medication?.name || '',
        dosage: medication?.dosage || '',
        timings: medication?.timings || ['08:00'],
        totalStock: medication?.totalStock || '',
        remainingStock: medication?.remainingStock || '',
        instructions: medication?.instructions || '',
    });
    const [loading, setLoading] = useState(false);

    const isEdit = !!medication;

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const addTiming = () => {
        if (form.timings.length < 6) {
            setForm((prev) => ({
                ...prev,
                timings: [...prev.timings, '12:00'],
            }));
        }
    };

    const removeTiming = (index) => {
        if (form.timings.length > 1) {
            setForm((prev) => ({
                ...prev,
                timings: prev.timings.filter((_, i) => i !== index),
            }));
        }
    };

    const updateTiming = (index, value) => {
        setForm((prev) => ({
            ...prev,
            timings: prev.timings.map((t, i) => (i === index ? value : t)),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...form,
                totalStock: Number(form.totalStock),
                remainingStock: isEdit ? Number(form.remainingStock) : Number(form.totalStock),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="med-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="med-name">Medicine Name</label>
                <input
                    id="med-name"
                    className="form-input"
                    type="text"
                    placeholder="e.g., Amoxicillin"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    autoComplete="off"
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="med-dosage">Dosage</label>
                <input
                    id="med-dosage"
                    className="form-input"
                    type="text"
                    placeholder="e.g., 500mg, 10ml"
                    value={form.dosage}
                    onChange={(e) => handleChange('dosage', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Timing(s)</label>
                <div className="med-form__timings">
                    {form.timings.map((time, index) => (
                        <div key={index} className="med-form__timing-row">
                            <input
                                className="form-input med-form__time-input"
                                type="time"
                                value={time}
                                onChange={(e) => updateTiming(index, e.target.value)}
                                required
                            />
                            {form.timings.length > 1 && (
                                <button
                                    type="button"
                                    className="med-form__remove-time"
                                    onClick={() => removeTiming(index)}
                                    aria-label="Remove timing"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {form.timings.length < 6 && (
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={addTiming}
                        >
                            + Add Time
                        </button>
                    )}
                </div>
                <div className="med-form__quick-timings">
                    <span className="text-small text-muted">Quick set:</span>
                    <button
                        type="button"
                        className="med-form__quick-btn"
                        onClick={() => handleChange('timings', ['08:00'])}
                    >
                        Once/day
                    </button>
                    <button
                        type="button"
                        className="med-form__quick-btn"
                        onClick={() => handleChange('timings', ['08:00', '20:00'])}
                    >
                        Twice/day
                    </button>
                    <button
                        type="button"
                        className="med-form__quick-btn"
                        onClick={() => handleChange('timings', DEFAULT_TIMINGS)}
                    >
                        Thrice/day
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="med-stock">
                    {isEdit ? 'Total Stock' : 'Stock Quantity'}
                </label>
                <input
                    id="med-stock"
                    className="form-input"
                    type="number"
                    placeholder="e.g., 30"
                    min="0"
                    value={form.totalStock}
                    onChange={(e) => handleChange('totalStock', e.target.value)}
                    required
                />
            </div>

            {isEdit && (
                <div className="form-group">
                    <label className="form-label" htmlFor="med-remaining">Remaining Stock</label>
                    <input
                        id="med-remaining"
                        className="form-input"
                        type="number"
                        min="0"
                        max={form.totalStock}
                        value={form.remainingStock}
                        onChange={(e) => handleChange('remainingStock', e.target.value)}
                        required
                    />
                </div>
            )}

            <div className="form-group">
                <label className="form-label" htmlFor="med-instructions">Instructions (Optional)</label>
                <input
                    id="med-instructions"
                    className="form-input"
                    type="text"
                    placeholder="e.g., Take after food"
                    value={form.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                />
            </div>

            <div className="med-form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? (
                        <span className="spinner spinner--sm" />
                    ) : isEdit ? 'Update' : 'Add Medicine'}
                </button>
            </div>
        </form>
    );
}

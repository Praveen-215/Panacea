const mongoose = require('mongoose');

const doseRecordSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        medicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medication',
            required: true,
            index: true,
        },
        scheduledTime: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['taken', 'missed', 'upcoming', 'skipped'],
            default: 'upcoming',
        },
        takenAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient schedule queries
doseRecordSchema.index({ userId: 1, date: 1 });
doseRecordSchema.index({ medicationId: 1, date: 1 });

module.exports = mongoose.model('DoseRecord', doseRecordSchema);

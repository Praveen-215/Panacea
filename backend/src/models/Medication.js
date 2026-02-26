const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true,
        },
        dosage: {
            type: String,
            required: [true, 'Dosage is required'],
            trim: true,
        },
        timings: {
            type: [String],
            required: [true, 'At least one timing is required'],
            validate: {
                validator: (v) => v.length > 0,
                message: 'At least one timing must be specified',
            },
        },
        instructions: {
            type: String,
            trim: true,
            default: '',
        },
        totalStock: {
            type: Number,
            required: [true, 'Total stock is required'],
            min: 0,
        },
        remainingStock: {
            type: Number,
            required: true,
            min: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure remainingStock doesn't exceed totalStock
medicationSchema.pre('save', function (next) {
    if (this.remainingStock > this.totalStock) {
        this.remainingStock = this.totalStock;
    }
    next();
});

module.exports = mongoose.model('Medication', medicationSchema);

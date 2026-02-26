const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Document name is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['xray', 'ctscan', 'mri', 'prescription', 'labreport'],
        },
        fileName: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Document', documentSchema);

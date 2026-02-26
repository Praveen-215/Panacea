const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Get all documents for user
exports.getAll = async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = { userId: req.userId };
        if (category) filter.category = category;

        const documents = await Document.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: documents });
    } catch (error) {
        next(error);
    }
};

// Upload document
exports.upload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name and category are required',
            });
        }

        const document = await Document.create({
            userId: req.userId,
            name,
            category,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
        });

        res.status(201).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
};

// Rename document
exports.rename = async (req, res, next) => {
    try {
        const { name } = req.body;

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        res.json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
};

// Delete document
exports.remove = async (req, res, next) => {
    try {
        const document = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        // Delete physical file
        const filePath = path.join(
            config.upload.dir,
            req.userId.toString(),
            document.fileName
        );
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        next(error);
    }
};

// Download / Preview document
exports.download = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        const filePath = path.join(
            config.upload.dir,
            req.userId.toString(),
            document.fileName
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            });
        }

        res.sendFile(path.resolve(filePath));
    } catch (error) {
        next(error);
    }
};

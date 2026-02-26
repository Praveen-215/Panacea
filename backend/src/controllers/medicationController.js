const Medication = require('../models/Medication');
const DoseRecord = require('../models/DoseRecord');

// Get all medications for user
exports.getAll = async (req, res, next) => {
    try {
        const medications = await Medication.find({ userId: req.userId }).sort({
            createdAt: -1,
        });
        res.json({ success: true, data: medications });
    } catch (error) {
        next(error);
    }
};

// Get single medication
exports.getOne = async (req, res, next) => {
    try {
        const medication = await Medication.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found',
            });
        }

        res.json({ success: true, data: medication });
    } catch (error) {
        next(error);
    }
};

// Create medication
exports.create = async (req, res, next) => {
    try {
        const { name, dosage, timings, totalStock, instructions } = req.body;

        const medication = await Medication.create({
            userId: req.userId,
            name,
            dosage,
            timings,
            totalStock,
            remainingStock: totalStock,
            instructions,
        });

        // Create today's dose records
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const doseRecords = timings.map((time) => ({
            userId: req.userId,
            medicationId: medication._id,
            scheduledTime: time,
            date: today,
            status: time < currentTime ? 'missed' : 'upcoming',
        }));

        await DoseRecord.insertMany(doseRecords);

        res.status(201).json({ success: true, data: medication });
    } catch (error) {
        next(error);
    }
};

// Update medication
exports.update = async (req, res, next) => {
    try {
        const { name, dosage, timings, totalStock, remainingStock, instructions, active } = req.body;

        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name, dosage, timings, totalStock, remainingStock, instructions, active },
            { new: true, runValidators: true }
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found',
            });
        }

        res.json({ success: true, data: medication });
    } catch (error) {
        next(error);
    }
};

// Delete medication
exports.remove = async (req, res, next) => {
    try {
        const medication = await Medication.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: 'Medication not found',
            });
        }

        // Delete associated dose records
        await DoseRecord.deleteMany({ medicationId: req.params.id });

        res.json({ success: true, message: 'Medication deleted' });
    } catch (error) {
        next(error);
    }
};

// Mark a dose as taken
exports.takeDose = async (req, res, next) => {
    try {
        const { medicationId, scheduledTime, date } = req.body;

        // Find the dose record
        let doseRecord = await DoseRecord.findOne({
            medicationId,
            userId: req.userId,
            scheduledTime,
            date,
        });

        if (!doseRecord) {
            // Create one if it doesn't exist
            doseRecord = await DoseRecord.create({
                medicationId,
                userId: req.userId,
                scheduledTime,
                date,
                status: 'taken',
                takenAt: new Date(),
            });
        } else {
            doseRecord.status = 'taken';
            doseRecord.takenAt = new Date();
            await doseRecord.save();
        }

        // Decrease remaining stock
        await Medication.findByIdAndUpdate(medicationId, {
            $inc: { remainingStock: -1 },
        });

        res.json({ success: true, data: doseRecord });
    } catch (error) {
        next(error);
    }
};

// Get today's schedule
exports.getTodaySchedule = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Get all active medications
        const medications = await Medication.find({
            userId: req.userId,
            active: true,
        });

        // Get existing dose records for today
        const existingRecords = await DoseRecord.find({
            userId: req.userId,
            date: today,
        });

        const schedule = [];

        for (const med of medications) {
            for (const time of med.timings) {
                // Check if dose record exists
                const existing = existingRecords.find(
                    (r) => r.medicationId.toString() === med._id.toString() && r.scheduledTime === time
                );

                if (existing) {
                    schedule.push({
                        ...existing.toObject(),
                        medication: med,
                    });
                } else {
                    // Auto-create dose record
                    const status = time < currentTime ? 'missed' : 'upcoming';
                    const record = await DoseRecord.create({
                        userId: req.userId,
                        medicationId: med._id,
                        scheduledTime: time,
                        date: today,
                        status,
                    });
                    schedule.push({
                        ...record.toObject(),
                        medication: med,
                    });
                }
            }
        }

        // Sort by scheduled time
        schedule.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

const User = require('../models/User');
const config = require('../config/env');

// Save push subscription
exports.subscribe = async (req, res, next) => {
    try {
        const { subscription } = req.body;

        if (!subscription) {
            return res.status(400).json({
                success: false,
                message: 'Push subscription is required',
            });
        }

        await User.findByIdAndUpdate(req.userId, {
            pushSubscription: subscription,
        });

        res.json({ success: true, message: 'Push subscription saved' });
    } catch (error) {
        next(error);
    }
};

// Get VAPID public key
exports.getVapidKey = async (req, res) => {
    res.json({
        success: true,
        data: { publicKey: config.vapid.publicKey },
    });
};

// Unsubscribe from push
exports.unsubscribe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            pushSubscription: null,
        });

        res.json({ success: true, message: 'Push subscription removed' });
    } catch (error) {
        next(error);
    }
};

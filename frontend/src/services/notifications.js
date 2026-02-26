/**
 * Panacea — Notification Service
 * Handles push notification subscription and local notification fallback
 */
import api from './api';

class NotificationService {
    constructor() {
        this.permission = Notification?.permission || 'default';
        this.registration = null;
    }

    /**
     * Check if notifications are supported
     */
    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported()) return false;

        const result = await Notification.requestPermission();
        this.permission = result;
        return result === 'granted';
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe() {
        try {
            if (!this.isSupported()) {
                console.warn('Push notifications not supported');
                return false;
            }

            const granted = await this.requestPermission();
            if (!granted) return false;

            // Get VAPID key
            const { data } = await api.getVapidKey();
            if (!data.publicKey) {
                console.warn('VAPID key not configured on server');
                return false;
            }

            // Get service worker registration
            this.registration = await navigator.serviceWorker.ready;

            // Subscribe
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(data.publicKey),
            });

            // Send subscription to server
            await api.subscribePush(subscription.toJSON());
            console.log('✅ Push notifications subscribed');
            return true;
        } catch (error) {
            console.error('Push subscription failed:', error);
            return false;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await api.unsubscribePush();
            }
            return true;
        } catch (error) {
            console.error('Push unsubscribe failed:', error);
            return false;
        }
    }

    /**
     * Show a local notification (fallback for when Push is not available)
     */
    showLocalNotification(title, body, data = {}) {
        if (this.permission !== 'granted') return;

        if (this.registration) {
            this.registration.showNotification(title, {
                body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                vibrate: [200, 100, 200],
                data,
                actions: [
                    { action: 'take', title: '✅ Taken' },
                    { action: 'snooze', title: '⏰ Snooze' },
                ],
            });
        } else {
            new Notification(title, { body, icon: '/icons/icon-192.png' });
        }
    }

    /**
     * Schedule a local reminder (fallback using setTimeout)
     * Only works while the app is open
     */
    scheduleLocalReminder(medication, time) {
        const [h, m] = time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m, 0, 0);

        if (target <= now) return null; // Already passed

        const delay = target - now;
        const timerId = setTimeout(() => {
            this.showLocalNotification(
                '💊 Medicine Reminder',
                `Time to take ${medication.name} (${medication.dosage})`,
                { medicationId: medication._id, time }
            );
        }, delay);

        return timerId;
    }

    /**
     * Convert VAPID key
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

const notificationService = new NotificationService();
export default notificationService;

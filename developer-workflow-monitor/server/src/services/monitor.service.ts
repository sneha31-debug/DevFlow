import Monitor from '../models/Monitor.model';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.model';

export class MonitorService {
    // Perform a single check for a monitor
    static async checkMonitor(monitorId: string) {
        const monitor = await Monitor.findById(monitorId);
        if (!monitor) return;

        const previousStatus = monitor.status;
        const startTime = Date.now();
        let status: 'up' | 'down' = 'down';
        let responseTime = 0;

        try {
            const response = await fetch(monitor.url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
            responseTime = Date.now() - startTime;
            status = response.ok ? 'up' : 'down';
        } catch (error) {
            status = 'down';
            responseTime = 0;
        }

        // Log status change if it's not pending and status changed
        if (previousStatus !== status) {
            const user = monitor.user || (monitor as any).owner; // Handle potential schema differences

            await ActivityLog.create({
                user: user,
                project: monitor.project, // Link to project if exists
                action: status === 'up' ? 'MONITOR_UP' : 'MONITOR_DOWN',
                message: `Monitor ${monitor.name} is now ${status.toUpperCase()}`,
                metadata: {
                    monitorId: monitor._id,
                    url: monitor.url,
                    responseTime
                }
            });
        }

        // Update monitor
        monitor.status = status;
        monitor.responseTime = responseTime;
        monitor.lastChecked = new Date();
        monitor.history.push({
            timestamp: new Date(),
            status,
            responseTime
        });

        await monitor.save();
        return { status, responseTime };
    }

    // Run checks for all monitors (can be called by a cron job)
    static async runAllChecks() {
        console.log('Running monitor checks...');
        const monitors = await Monitor.find();
        let checked = 0;

        for (const monitor of monitors) {
            // Simple logic: Check if lastChecked + frequency < now
            // For now, we'll just check everything on every run for simplicity in this demo
            await this.checkMonitor(monitor._id.toString());
            checked++;
        }
        console.log(`Checked ${checked} monitors.`);
    }

    // Start a background interval
    static startMonitoringLoop(intervalMs = 60000) {
        console.log('Starting monitoring service...');
        setInterval(() => {
            this.runAllChecks().catch(console.error);
        }, intervalMs);
    }
}

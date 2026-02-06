import mongoose, { Schema, Document } from 'mongoose';

export interface IMonitor extends Document {
    user: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    name: string;
    url: string;
    frequency: number; // in minutes
    status: 'up' | 'down' | 'pending';
    lastChecked: Date;
    responseTime: number;
    history: {
        timestamp: Date;
        status: 'up' | 'down';
        responseTime: number;
    }[];
    createdAt: Date;
}

const MonitorSchema = new Schema<IMonitor>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    name: { type: String, required: true },
    url: { type: String, required: true },
    frequency: { type: Number, default: 5 }, // Default check every 5 mins
    status: { type: String, enum: ['up', 'down', 'pending'], default: 'pending' },
    lastChecked: { type: Date },
    responseTime: { type: Number },
    history: [{
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ['up', 'down'] },
        responseTime: { type: Number },
    }],
    createdAt: { type: Date, default: Date.now },
});

// Limit history to last 50 entries to prevent document bloat
MonitorSchema.pre('save', function (next) {
    if (this.history.length > 50) {
        this.history = this.history.slice(-50);
    }
    next();
});

export default mongoose.model<IMonitor>('Monitor', MonitorSchema);

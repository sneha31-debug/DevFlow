import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
    project?: mongoose.Types.ObjectId;
    repository?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    action: string;
    message: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    repository: { type: Schema.Types.ObjectId, ref: 'Repository' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
});

// Index for efficient querying
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ project: 1, timestamp: -1 });
ActivityLogSchema.index({ repository: 1, timestamp: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

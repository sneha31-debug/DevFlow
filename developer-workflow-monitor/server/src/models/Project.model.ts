import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description?: string;
    repository: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    status: 'active' | 'paused' | 'completed';
    lastActivityAt: Date;
    createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String },
    repository: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    lastActivityAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

// Ensure one project per repository per user
ProjectSchema.index({ repository: 1, owner: 1 }, { unique: true });

export default mongoose.model<IProject>('Project', ProjectSchema);   
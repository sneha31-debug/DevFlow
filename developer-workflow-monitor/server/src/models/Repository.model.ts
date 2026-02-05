import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
    githubId: number;
    name: string;
    fullName: string;
    description?: string;
    url: string;
    language?: string;
    isPrivate: boolean;
    stars: number;
    forks: number;
    owner: mongoose.Types.ObjectId;
    lastSyncedAt: Date;
    createdAt: Date;
}

const RepositorySchema = new Schema<IRepository>({
    githubId: { type: Number, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    language: { type: String },
    isPrivate: { type: Boolean, default: false },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastSyncedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

// Compound index for unique repo per user
RepositorySchema.index({ githubId: 1, owner: 1 }, { unique: true });

export default mongoose.model<IRepository>('Repository', RepositorySchema);

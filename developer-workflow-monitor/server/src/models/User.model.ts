import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    githubId: string;
    username: string;
    email?: string; // GitHub email might be private
    avatarUrl?: string;
    displayName?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String },
    avatarUrl: { type: String },
    displayName: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);

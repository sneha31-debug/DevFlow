import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    githubId?: string;
    username: string;
    email?: string;
    password?: string; // Only for email/password users
    avatarUrl?: string;
    displayName?: string;
    authProvider: 'github' | 'local';
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    githubId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false }, // Don't return password by default
    avatarUrl: { type: String },
    displayName: { type: String },
    authProvider: { type: String, enum: ['github', 'local'], default: 'local' },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

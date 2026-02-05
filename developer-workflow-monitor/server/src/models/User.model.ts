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
    githubAccessToken?: string; // For GitHub API access
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    githubId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false }, // Don't return password by default
    avatarUrl: { type: String },
    displayName: { type: String },
    authProvider: { type: String, enum: ['github', 'local'], default: 'local' },
    githubAccessToken: { type: String, select: false }, // Store GitHub OAuth token
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IApiTest extends Document {
    user: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: string; // JSON string
    assertions?: {
        type: 'status' | 'contains' | 'json_path' | 'time';
        target?: string;
        value?: string | number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ApiTestSchema = new Schema<IApiTest>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    name: { type: String, required: true },
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
    url: { type: String, required: true },
    headers: { type: Map, of: String },
    body: { type: String },
    assertions: [{
        type: { type: String, enum: ['status', 'contains', 'json_path', 'time'], required: true },
        target: { type: String },
        value: { type: Schema.Types.Mixed }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ApiTestSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IApiTest>('ApiTest', ApiTestSchema);

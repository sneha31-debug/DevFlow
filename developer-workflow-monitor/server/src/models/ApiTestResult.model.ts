import mongoose, { Schema, Document } from 'mongoose';

export interface IApiTestResult extends Document {
    test: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    status: number;
    responseTime: number;
    success: boolean;
    error?: string;
    responseBody?: any;
    assertionResults: {
        type: string;
        target?: string;
        value?: any;
        passed: boolean;
        actual?: any;
    }[];
    timestamp: Date;
}

const ApiTestResultSchema = new Schema<IApiTestResult>({
    test: { type: Schema.Types.ObjectId, ref: 'ApiTest', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: { type: Number },
    responseTime: { type: Number, required: true },
    success: { type: Boolean, required: true },
    error: { type: String },
    responseBody: { type: Schema.Types.Mixed },
    assertionResults: [{
        type: { type: String },
        target: { type: String },
        value: { type: Schema.Types.Mixed },
        passed: { type: Boolean, required: true },
        actual: { type: Schema.Types.Mixed }
    }],
    timestamp: { type: Date, default: Date.now }
});

// Index for getting history of a specific test
ApiTestResultSchema.index({ test: 1, timestamp: -1 });
// Index for project timeline
ApiTestResultSchema.index({ project: 1, timestamp: -1 });

export default mongoose.model<IApiTestResult>('ApiTestResult', ApiTestResultSchema);

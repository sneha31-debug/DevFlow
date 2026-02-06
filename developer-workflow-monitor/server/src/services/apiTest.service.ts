import ApiTest, { IApiTest } from '../models/ApiTest.model';
import ApiTestResult from '../models/ApiTestResult.model';
import ActivityLog from '../models/ActivityLog.model';
import mongoose from 'mongoose';

export class ApiTestService {
    // Run a single API test
    // Run a single API test by ID
    static async runTest(testId: string, userId: string) {
        const test = await ApiTest.findById(testId);
        if (!test) throw new Error('Test not found');

        const resultData = await this.performRequest(test.url, test.method, test.headers, test.body);

        // Evaluate Assertions
        const assertionResults = this.evaluateAssertions(test, resultData.status, resultData.responseTime, resultData.responseBody);

        let success = false;
        if (test.assertions && test.assertions.length > 0) {
            success = assertionResults.every(r => r.passed);
        } else {
            success = resultData.status >= 200 && resultData.status < 300;
        }

        // Save Result
        const result = await ApiTestResult.create({
            test: test._id,
            user: userId,
            project: test.project,
            status: resultData.status,
            responseTime: resultData.responseTime,
            success,
            responseBody: resultData.responseBody,
            error: resultData.error,
            assertionResults,
            timestamp: new Date()
        });

        // Log Activity
        await ActivityLog.create({
            user: userId,
            project: test.project,
            action: 'API_TEST_RUN',
            message: `API Test "${test.name}" ${success ? 'PASSED' : 'FAILED'} ${resultData.error ? '(Network Error)' : ''}`,
            metadata: {
                testId: test._id,
                resultId: result._id,
                status: resultData.status,
                responseTime: resultData.responseTime,
                error: resultData.error
            }
        });

        return result;
    }

    // Run an ad-hoc test (not saved in DB)
    static async runAdHocTest(config: { url: string, method: string, headers?: any, body?: any }, userId: string) {
        return await this.performRequest(config.url, config.method, config.headers, config.body);
    }

    private static async performRequest(url: string, method: string, headers: any = {}, body: any) {
        const startTime = Date.now();
        let status = 0;
        let responseTime = 0;
        let responseBody: any = null;
        let error: string | undefined = undefined;

        try {
            // Ensure Content-Type if body present
            if (body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const bodyToSend = (body && typeof body === 'object') ? JSON.stringify(body) : body;

            const response = await fetch(url, {
                method,
                headers,
                body: ['GET', 'HEAD'].includes(method) ? undefined : bodyToSend,
                signal: AbortSignal.timeout(10000)
            });

            status = response.status;
            responseTime = Date.now() - startTime;

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseBody = await response.json();
            } else {
                responseBody = await response.text();
            }

            return { status, responseTime, responseBody, error: undefined };

        } catch (err: any) {
            return {
                status: 0,
                responseTime: Date.now() - startTime,
                responseBody: null,
                error: err.message
            };
        }
    }

    private static evaluateAssertions(test: IApiTest, status: number, responseTime: number, body: any) {
        if (!test.assertions) return [];

        return test.assertions.map(assertion => {
            let passed = false;
            let actual: any = null;

            switch (assertion.type) {
                case 'status':
                    passed = status === Number(assertion.value);
                    actual = status;
                    break;
                case 'time':
                    passed = responseTime <= Number(assertion.value);
                    actual = responseTime;
                    break;
                case 'contains':
                    if (typeof body === 'string') {
                        passed = body.includes(String(assertion.value));
                    } else {
                        passed = JSON.stringify(body).includes(String(assertion.value));
                    }
                    actual = 'Body content';
                    break;
                case 'json_path':
                    // Simple nested access for demo: "data.id"
                    if (assertion.target && typeof body === 'object') {
                        const path = assertion.target.split('.');
                        let current = body;
                        for (const key of path) {
                            if (current && typeof current === 'object') {
                                current = current[key];
                            } else {
                                current = undefined;
                                break;
                            }
                        }
                        actual = current;
                        passed = String(current) === String(assertion.value);
                    }
                    break;
            }

            return {
                type: assertion.type,
                target: assertion.target,
                value: assertion.value,
                passed,
                actual
            };
        });
    }
}

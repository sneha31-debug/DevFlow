import ApiTest, { IApiTest } from '../models/ApiTest.model';
import ApiTestResult from '../models/ApiTestResult.model';
import ActivityLog from '../models/ActivityLog.model';
import mongoose from 'mongoose';

export class ApiTestService {
    // Run a single API test
    static async runTest(testId: string, userId: string) {
        const test = await ApiTest.findById(testId);
        if (!test) throw new Error('Test not found');

        const startTime = Date.now();
        let status = 0;
        let success = false;
        let responseBody: any = null;
        let error: string | undefined = undefined;
        let responseTime = 0;

        try {
            const headers = test.headers ? Object.fromEntries(test.headers) : {};
            // Ensure Content-Type is set if body is present
            if (test.body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(test.url, {
                method: test.method,
                headers: headers,
                body: ['GET', 'HEAD'].includes(test.method) ? undefined : test.body,
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            status = response.status;
            responseTime = Date.now() - startTime;

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseBody = await response.json();
            } else {
                responseBody = await response.text();
            }

            // Evaluate Assertions
            const assertionResults = this.evaluateAssertions(test, status, responseTime, responseBody);

            // Determine overall success (all assertions passed, or if no assertions, status is 2xx)
            if (test.assertions && test.assertions.length > 0) {
                success = assertionResults.every(r => r.passed);
            } else {
                success = status >= 200 && status < 300;
            }

            // Save Result
            const result = await ApiTestResult.create({
                test: test._id,
                user: userId,
                project: test.project,
                status,
                responseTime,
                success,
                responseBody,
                assertionResults,
                timestamp: new Date()
            });

            // Log Activity linked to Project
            await ActivityLog.create({
                user: userId,
                project: test.project,
                action: 'API_TEST_RUN',
                message: `API Test "${test.name}" ${success ? 'PASSED' : 'FAILED'}`,
                metadata: {
                    testId: test._id,
                    resultId: result._id,
                    status,
                    responseTime
                }
            });

            return result;

        } catch (err: any) {
            responseTime = Date.now() - startTime;
            success = false;
            error = err.message;

            const result = await ApiTestResult.create({
                test: test._id,
                user: userId,
                project: test.project,
                status: 0,
                responseTime,
                success: false,
                error,
                assertionResults: [], // No assertions run on network failure
                timestamp: new Date()
            });

            // Log Activity for failure as well
            await ActivityLog.create({
                user: userId,
                project: test.project,
                action: 'API_TEST_RUN',
                message: `API Test "${test.name}" FAILED (Network Error)`,
                metadata: {
                    testId: test._id,
                    resultId: result._id,
                    error
                }
            });

            return result;
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

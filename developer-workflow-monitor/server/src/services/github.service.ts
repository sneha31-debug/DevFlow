import User, { IUser } from '../models/User.model';
import Repository from '../models/Repository.model';
import ActivityLog from '../models/ActivityLog.model';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    private: boolean;
    stargazers_count: number;
    forks_count: number;
}

export class GitHubService {
    private accessToken: string;
    private baseUrl = 'https://api.github.com';

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async fetch(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'developer-workflow-monitor',
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getUserRepos(): Promise<GitHubRepo[]> {
        return this.fetch('/user/repos?per_page=100&sort=updated');
    }

    async getRepoDetails(owner: string, repo: string): Promise<GitHubRepo> {
        return this.fetch(`/repos/${owner}/${repo}`);
    }

    async getRepoEvents(owner: string, repo: string) {
        return this.fetch(`/repos/${owner}/${repo}/events?per_page=30`);
    }

    async getUserEvents() {
        return this.fetch('/users/events?per_page=50');
    }
}

export async function syncUserRepositories(userId: string): Promise<number> {
    const user = await User.findById(userId).select('+githubAccessToken');

    if (!user || !user.githubAccessToken) {
        throw new Error('No GitHub token available. Please logout and login with GitHub again to authorize repository access.');
    }

    const github = new GitHubService(user.githubAccessToken);
    const repos = await github.getUserRepos();

    let syncedCount = 0;

    for (const repo of repos) {
        await Repository.findOneAndUpdate(
            { githubId: repo.id, owner: userId },
            {
                githubId: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description || '',
                url: repo.html_url,
                language: repo.language || 'Unknown',
                isPrivate: repo.private,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                owner: userId,
                lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
        );
        syncedCount++;
    }

    // Log the sync activity
    await ActivityLog.create({
        user: userId,
        action: 'REPO_SYNC',
        message: `Synced ${syncedCount} repositories from GitHub`,
        metadata: { count: syncedCount },
    });

    return syncedCount;
}

export async function logActivity(
    userId: string,
    action: string,
    message: string,
    repoId?: string,
    metadata?: Record<string, any>
) {
    return ActivityLog.create({
        user: userId,
        repository: repoId,
        action,
        message,
        metadata,
    });
}

import User from '../models/User.model';
import Repository from '../models/Repository.model';
import ActivityLog from '../models/ActivityLog.model';
import Project from '../models/Project.model';

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

interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    html_url: string;
}

interface GitHubEvent {
    id: string;
    type: string;
    created_at: string;
    payload: {
        action?: string;
        commits?: Array<{ message: string; sha: string }>;
        ref?: string;
        size?: number;
    };
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

    async getRepoCommits(owner: string, repo: string, perPage = 10): Promise<GitHubCommit[]> {
        return this.fetch(`/repos/${owner}/${repo}/commits?per_page=${perPage}`);
    }

    async getRepoEvents(owner: string, repo: string, perPage = 30): Promise<GitHubEvent[]> {
        return this.fetch(`/repos/${owner}/${repo}/events?per_page=${perPage}`);
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

export async function fetchProjectLogs(projectId: string, userId: string) {
    const project = await Project.findOne({ _id: projectId, owner: userId })
        .populate('repository');

    if (!project) {
        throw new Error('Project not found');
    }

    const user = await User.findById(userId).select('+githubAccessToken');
    if (!user || !user.githubAccessToken) {
        throw new Error('No GitHub token available');
    }

    const repo = project.repository as any;
    const [owner, repoName] = repo.fullName.split('/');

    const github = new GitHubService(user.githubAccessToken);

    try {
        // Fetch recent commits from GitHub
        const commits = await github.getRepoCommits(owner, repoName, 10);

        // Create log entries for new commits
        for (const commit of commits) {
            const existingLog = await ActivityLog.findOne({
                project: projectId,
                'metadata.sha': commit.sha,
            });

            if (!existingLog) {
                await ActivityLog.create({
                    project: projectId,
                    repository: repo._id,
                    user: userId,
                    action: 'COMMIT',
                    message: commit.commit.message.split('\n')[0], // First line only
                    metadata: {
                        sha: commit.sha,
                        author: commit.commit.author.name,
                        url: commit.html_url,
                    },
                    timestamp: new Date(commit.commit.author.date),
                });
            }
        }

        // Fetch events from GitHub
        const events = await github.getRepoEvents(owner, repoName, 20);

        for (const event of events) {
            const existingLog = await ActivityLog.findOne({
                project: projectId,
                'metadata.eventId': event.id,
            });

            if (!existingLog && event.type !== 'PushEvent') { // Skip push events (covered by commits)
                let action = event.type.replace('Event', '').toUpperCase();
                let message = '';

                switch (event.type) {
                    case 'IssuesEvent':
                        message = `Issue ${event.payload.action}`;
                        break;
                    case 'PullRequestEvent':
                        message = `Pull request ${event.payload.action}`;
                        break;
                    case 'CreateEvent':
                        message = `Created ${event.payload.ref || 'repository'}`;
                        break;
                    case 'DeleteEvent':
                        message = `Deleted ${event.payload.ref}`;
                        break;
                    case 'WatchEvent':
                        message = 'Starred repository';
                        action = 'STAR';
                        break;
                    case 'ForkEvent':
                        message = 'Repository forked';
                        break;
                    default:
                        message = event.type.replace('Event', '');
                }

                await ActivityLog.create({
                    project: projectId,
                    repository: repo._id,
                    user: userId,
                    action,
                    message,
                    metadata: {
                        eventId: event.id,
                        type: event.type,
                    },
                    timestamp: new Date(event.created_at),
                });
            }
        }

        // Update project's last activity
        await Project.findByIdAndUpdate(projectId, { lastActivityAt: new Date() });

    } catch (error: any) {
        console.error('Error fetching GitHub events:', error.message);
    }

    // Return all logs for this project
    return ActivityLog.find({ project: projectId })
        .sort({ timestamp: -1 })
        .limit(50);
}

export async function logActivity(
    userId: string,
    action: string,
    message: string,
    projectId?: string,
    repoId?: string,
    metadata?: Record<string, any>
) {
    return ActivityLog.create({
        user: userId,
        project: projectId,
        repository: repoId,
        action,
        message,
        metadata,
    });
}

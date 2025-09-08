import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { simpleGit, SimpleGit } from 'simple-git';

export class LinkGenerator {
    async generateLink(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        
        // If not in a workspace, try to find the git root from the file path
        let gitRoot: string;
        if (workspaceFolder) {
            gitRoot = workspaceFolder.uri.fsPath;
        } else {
            const foundGitRoot = await this.findGitRoot(document.uri.fsPath);
            if (!foundGitRoot) {
                vscode.window.showErrorMessage('File is not in a Git repository');
                return;
            }
            gitRoot = foundGitRoot;
        }

        try {
            const git = simpleGit(gitRoot);
            
            // Get repository info
            const remotes = await git.getRemotes(true);
            const origin = remotes.find(remote => remote.name === 'origin');
            
            if (!origin) {
                vscode.window.showErrorMessage('No origin remote found');
                return;
            }

            // Parse GitHub URL from origin
            const githubUrl = this.parseGitHubUrl(origin.refs.fetch);
            if (!githubUrl) {
                vscode.window.showErrorMessage('Repository is not hosted on GitHub');
                return;
            }

            // Get current branch
            const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
            
            // Check if local repo is up to date with remote (if autoSync is enabled)
            const config = vscode.workspace.getConfiguration('vsgitlink');
            const autoSync = config.get<boolean>('autoSync', true);
            
            if (autoSync) {
                await this.checkAndOfferSync(git);
            }

            // Check for uncommitted changes
            const status = await git.status();
            const hasUncommittedChanges = status.files.length > 0;

            if (hasUncommittedChanges) {
                const choice = await vscode.window.showWarningMessage(
                    'You have uncommitted changes. The generated link may not work for others.',
                    'Continue Anyway',
                    'Commit Changes'
                );

                if (choice === 'Commit Changes') {
                    await this.promptCommit(git);
                    return;
                } else if (choice === undefined) {
                    return; // User cancelled
                }
            }

            // Generate the link
            const relativePath = path.relative(gitRoot, document.uri.fsPath);
            const selection = editor.selection;
            
            let link = `https://github.com/${githubUrl.owner}/${githubUrl.repo}/blob/${currentBranch}/${relativePath}`;
            
            // Add line numbers if there's a selection
            if (!selection.isEmpty) {
                const startLine = selection.start.line + 1; // Convert to 1-based
                const endLine = selection.end.line + 1;
                
                if (startLine === endLine) {
                    link += `#L${startLine}`;
                } else {
                    link += `#L${startLine}-L${endLine}`;
                }
            }

            // Copy to clipboard
            await vscode.env.clipboard.writeText(link);
            vscode.window.showInformationMessage(`GitHub link copied to clipboard: ${link}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate link: ${error}`);
        }
    }

    private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
        // Parse URLs like:
        // https://github.com/owner/repo.git
        // git@github.com:owner/repo.git
        const httpsMatch = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
        if (httpsMatch) {
            return { owner: httpsMatch[1], repo: httpsMatch[2] };
        }

        const sshMatch = url.match(/git@github\.com:([^\/]+)\/([^\/]+)\.git/);
        if (sshMatch) {
            return { owner: sshMatch[1], repo: sshMatch[2] };
        }

        return null;
    }

    private async checkAndOfferSync(git: SimpleGit): Promise<void> {
        try {
            // Fetch latest changes from remote
            await git.fetch();
            
            // Check if local branch is behind remote
            const status = await git.status();
            const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
            const remoteBranch = `origin/${currentBranch}`;
            
            // Get commit counts
            const localCommits = await git.raw(['rev-list', '--count', 'HEAD']);
            const remoteCommits = await git.raw(['rev-list', '--count', remoteBranch]);
            
            if (parseInt(remoteCommits) > parseInt(localCommits)) {
                const choice = await vscode.window.showWarningMessage(
                    `Your local branch is ${parseInt(remoteCommits) - parseInt(localCommits)} commits behind the remote. The generated link may not reflect the latest changes.`,
                    'Continue Anyway',
                    'Pull with Rebase'
                );

                if (choice === 'Pull with Rebase') {
                    await this.pullWithRebase(git);
                } else if (choice === undefined) {
                    throw new Error('User cancelled due to outdated local branch');
                }
            }
        } catch (error) {
            // If we can't check sync status, continue anyway
            console.warn('Could not check sync status:', error);
        }
    }

    private async pullWithRebase(git: SimpleGit): Promise<void> {
        try {
            vscode.window.showInformationMessage('Pulling latest changes with rebase...');
            await git.pull('origin', await git.revparse(['--abbrev-ref', 'HEAD']), ['--rebase']);
            vscode.window.showInformationMessage('Successfully pulled latest changes');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to pull with rebase: ${error}`);
            throw error;
        }
    }

    private async promptCommit(git: SimpleGit): Promise<void> {
        const message = await vscode.window.showInputBox({
            prompt: 'Enter commit message',
            placeHolder: 'Update changes for sharing'
        });

        if (message) {
            try {
                await git.add('.');
                await git.commit(message);
                vscode.window.showInformationMessage('Changes committed successfully');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to commit: ${error}`);
            }
        }
    }

    private async findGitRoot(filePath: string): Promise<string | null> {
        let currentPath = path.dirname(filePath);
        
        while (currentPath !== path.dirname(currentPath)) {
            const gitPath = path.join(currentPath, '.git');
            if (fs.existsSync(gitPath)) {
                return currentPath;
            }
            currentPath = path.dirname(currentPath);
        }
        
        return null;
    }
}

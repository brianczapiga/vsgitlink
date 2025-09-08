import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { simpleGit, SimpleGit } from 'simple-git';
import { GitHubUrlParser } from './githubUrlParser';
import { RepositoryManager } from './repositoryManager';

export interface GitHubLinkInfo {
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
    startLine?: number;
    endLine?: number;
}

export class GitHubLinkHandler {
    private urlParser: GitHubUrlParser;
    private repoManager: RepositoryManager;

    constructor() {
        this.urlParser = new GitHubUrlParser();
        this.repoManager = new RepositoryManager();
    }

    async handleGitHubLink(url: string): Promise<void> {
        try {
            const linkInfo = this.urlParser.parseUrl(url);
            if (!linkInfo) {
                vscode.window.showErrorMessage('Invalid GitHub URL format');
                return;
            }

            // Check if repository exists in workspace
            const repoPath = await this.repoManager.ensureRepository(linkInfo);
            
            // Check if we need to sync the repository
            await this.checkRepositorySync(repoPath, linkInfo.branch);
            
            // Open the file
            const fullFilePath = path.join(repoPath, linkInfo.filePath);
            const document = await vscode.workspace.openTextDocument(fullFilePath);
            const editor = await vscode.window.showTextDocument(document);

            // Navigate to specific lines if provided
            if (linkInfo.startLine) {
                const startLine = Math.max(0, linkInfo.startLine - 1); // Convert to 0-based index
                const endLine = linkInfo.endLine ? Math.max(0, linkInfo.endLine - 1) : startLine;
                
                const startPos = new vscode.Position(startLine, 0);
                const endPos = new vscode.Position(endLine, 0);
                const selection = new vscode.Selection(startPos, endPos);
                
                editor.selection = selection;
                editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
            }

            vscode.window.showInformationMessage(`Opened ${linkInfo.owner}/${linkInfo.repo} at ${linkInfo.filePath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to handle GitHub link: ${error}`);
        }
    }

    private async checkRepositorySync(repoPath: string, targetBranch: string): Promise<void> {
        try {
            const git = simpleGit(repoPath);
            
            // Fetch latest changes
            await git.fetch();
            
            // Check if we're on the right branch
            const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
            if (currentBranch !== targetBranch) {
                // Switch to the target branch
                try {
                    await git.checkout(targetBranch);
                } catch (error) {
                    // Branch might not exist locally, try to fetch and checkout
                    await git.fetch('origin', targetBranch);
                    await git.checkout(`origin/${targetBranch}`);
                }
            }
            
            // Check if local branch is behind remote
            const remoteBranch = `origin/${targetBranch}`;
            const localCommits = await git.raw(['rev-list', '--count', 'HEAD']);
            const remoteCommits = await git.raw(['rev-list', '--count', remoteBranch]);
            
            if (parseInt(remoteCommits) > parseInt(localCommits)) {
                const choice = await vscode.window.showWarningMessage(
                    `The local ${targetBranch} branch is ${parseInt(remoteCommits) - parseInt(localCommits)} commits behind the remote. Would you like to pull the latest changes?`,
                    'Continue Anyway',
                    'Pull with Rebase'
                );

                if (choice === 'Pull with Rebase') {
                    await git.pull('origin', targetBranch, ['--rebase']);
                    vscode.window.showInformationMessage('Successfully pulled latest changes');
                }
            }
        } catch (error) {
            // If we can't check sync status, continue anyway
            console.warn('Could not check repository sync status:', error);
        }
    }
}

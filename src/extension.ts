import * as vscode from 'vscode';
import { GitHubLinkHandler } from './githubLinkHandler';
import { LinkGenerator } from './linkGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('VS Git Link extension is now active!');

    const githubLinkHandler = new GitHubLinkHandler();
    const linkGenerator = new LinkGenerator();

    // Register commands
    const openGitHubLinkCommand = vscode.commands.registerCommand('vsgitlink.openGitHubLink', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Enter GitHub URL',
            placeHolder: 'https://github.com/owner/repo/blob/branch/path/to/file.ts#L10-L20'
        });

        if (input) {
            await githubLinkHandler.handleGitHubLink(input);
        }
    });

    const generateGitHubLinkCommand = vscode.commands.registerCommand('vsgitlink.generateGitHubLink', async () => {
        await linkGenerator.generateLink();
    });

    context.subscriptions.push(openGitHubLinkCommand, generateGitHubLinkCommand);
}

export function deactivate() {}

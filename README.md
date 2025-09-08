# VS Git Link

A Visual Studio Code extension that seamlessly integrates GitHub links into your development workflow.

## Features

### 🔗 Open GitHub Links
- Paste any GitHub URL and automatically clone/open the repository
- Navigate directly to specific files and line numbers
- Support for different branches and commit references

### 📤 Generate GitHub Links
- Right-click in any file to generate a shareable GitHub link
- Automatically detects current branch and file path
- Includes line number ranges for selected text
- Warns about uncommitted changes and offers to commit them

## Usage

### Opening GitHub Links
1. Use `Ctrl+Shift+G O` (or `Cmd+Shift+G O` on Mac) to open the command palette
2. Select "Open GitHub Link" 
3. Paste your GitHub URL (e.g., `https://github.com/owner/repo/blob/branch/file.ts#L10-L20`)

### Generating GitHub Links
1. Select text in any file (optional)
2. Right-click and select "Generate GitHub Link" or use `Ctrl+Shift+G L`
3. The link will be copied to your clipboard

## Repository Structure

The extension follows your preferred directory structure:
- Repositories are stored in `~/repos/owner/repo`
- This mirrors the GitHub URL structure for easy navigation

## Configuration

The extension can be configured through VS Code settings:

- **`vsgitlink.reposPath`** (default: `~/repos`): Base path where repositories will be stored. Use `~` for home directory. Repositories will be stored in `{reposPath}/{owner}/{repo}` format.
- **`vsgitlink.defaultBranch`** (default: `main`): Default branch name to use when no branch is specified in GitHub URLs.
- **`vsgitlink.autoSync`** (default: `true`): Automatically check and offer to sync repositories when they are behind remote.

### Example Configuration

```json
{
  "vsgitlink.reposPath": "~/code",
  "vsgitlink.defaultBranch": "master",
  "vsgitlink.autoSync": false
}
```

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to run the extension in a new Extension Development Host window

## Development

```bash
npm install
npm run compile
```

## Commands

- `vsgitlink.openGitHubLink` - Open a GitHub link
- `vsgitlink.generateGitHubLink` - Generate a GitHub link for current file/selection

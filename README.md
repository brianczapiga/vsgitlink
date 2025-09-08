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

### Method 1: Install from VSIX Package (Recommended)

1. **Download the extension package**
   - Go to the [Releases](https://github.com/brianczapiga/vsgitlink/releases) page
   - Download the latest `vsgitlink-x.x.x.vsix` file

2. **Install in VS Code**
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
   - Click the "..." menu in the Extensions panel
   - Select "Install from VSIX..."
   - Navigate to and select the downloaded `.vsix` file

### Method 2: Clone and Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/brianczapiga/vsgitlink.git
   cd vsgitlink
   ```

2. **Install dependencies and compile**
   ```bash
   npm install
   npm run compile
   ```

3. **Package the extension**
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

4. **Install the VSIX package**
   - Use Method 1 above to install the generated `.vsix` file

### Method 3: Development Installation

1. **Clone and setup**
   ```bash
   git clone https://github.com/brianczapiga/vsgitlink.git
   cd vsgitlink
   npm install
   ```

2. **Run in development mode**
   - Open the `vsgitlink` folder in VS Code
   - Press `F5` to launch Extension Development Host
   - Test the extension in the new window

## Quick Start

Once installed, you can immediately start using the extension:

### Opening GitHub Links
1. Press `Ctrl+Shift+G O` (or `Cmd+Shift+G O` on Mac)
2. Paste a GitHub URL like: `https://github.com/microsoft/vscode/blob/main/package.json#L10-L20`
3. The extension will clone the repo (if needed) and open the file at the specified lines

### Generating GitHub Links
1. Open any file in a Git repository
2. Select some text (optional)
3. Right-click and choose "Generate GitHub Link" or press `Ctrl+Shift+G L`
4. The link is copied to your clipboard

### Configuration
Configure the extension in VS Code settings (`Ctrl+,` or `Cmd+,`):
- Set your preferred repository path (default: `~/repos`)
- Choose your default branch (default: `main`)
- Enable/disable automatic sync checks

## Development

```bash
npm install
npm run compile
```

## Commands

- `vsgitlink.openGitHubLink` - Open a GitHub link
- `vsgitlink.generateGitHubLink` - Generate a GitHub link for current file/selection

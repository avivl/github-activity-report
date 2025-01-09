# GitHub Activity Report

A React application that generates weekly reports of your GitHub activities within an organization. Track your pull requests, reviews, and comments in a clean, exportable format.

🔗 **[Live Demo](https://avivl.github.io/github-activity-report)**

## Features

- 🗓️ Weekly activity tracking
- 📊 Track Pull Requests, Reviews, and Comments
- 📱 Responsive design
- 📥 Export to HTML
- ⚙️ Configurable settings
- 🔄 Week-by-week navigation

## Demo

Visit the live application at: [https://avivl.github.io/github-activity-report](https://avivl.github.io/github-activity-report)

To use the demo, you'll need:
1. Your GitHub organization name
2. Your GitHub username
3. A GitHub Personal Access Token with `repo` and `user` scopes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A GitHub Personal Access Token with `repo` and `user` scopes

### Installation

1. Clone the repository:
```bash
git clone https://github.com/avivl/github-activity-report.git
cd github-activity-report
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Configuration

The application requires the following configuration:

- **Organization name**: The GitHub organization to fetch data from
- **GitHub username**: The user whose activities you want to track
- **Items per section**: Number of items to fetch (1-100, default: 50)
- **GitHub Token**: Personal access token with required scopes

### Deployment

To deploy to GitHub Pages:

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add these to your package.json:
```json
{
  "homepage": "https://[username].github.io/github-activity-report",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

## Usage

1. Enter your configuration details (org name, username, etc.)
2. Select the desired week using the navigation buttons
3. Click "Load Data" to fetch your GitHub activities
4. Review the data displayed in three sections:
   - Opened Pull Requests
   - Reviewed Pull Requests
   - Commented Pull Requests
5. Use the "Export Report" button to download an HTML version of the report

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React
- Uses GitHub's GraphQL API
- Styled with inline styles for simplicity
# FFXIV Tools

A comprehensive companion app for Final Fantasy XIV, featuring crafting assistance, gathering tracking, and more.

## Features

- **Crafting Assistant** - Manage inventory and check craftability of items
- **Gathering Tracker** (Coming Soon) - Track gathering nodes and timers
- **Loot Farming** (Coming Soon) - Optimize loot farming routes
- **Raid Plans** (Coming Soon) - Plan and coordinate raid strategies
- **Island Sanctuary** (Coming Soon) - Manage island sanctuary activities
- **Field Operations** (Coming Soon) - Track field operation objectives

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

2. Install dependencies:
```bash
npm install
```

3. Update the base path in `vite.config.js`:
```javascript
base: '/YOUR-REPO-NAME/', // Change this to your actual repo name
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment to GitHub Pages

1. Build and deploy:
```bash
npm run deploy
```

2. Configure GitHub Pages:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Set Source to "Deploy from branch"
   - Select branch: `gh-pages`
   - Select folder: `/ (root)`
   - Click Save

3. Your app will be live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Project Structure

```
ffxiv-tools/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind CSS imports
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Build and deploy to GitHub Pages

### Adding New Features

The app is designed to be modular. To add a new tool:

1. Create a new component in `src/App.jsx`
2. Add a menu item to the `menuItems` array in the Sidebar component
3. Add a route in the main content area

## API Integration

This app uses the following APIs:

- **XIVAPI** (https://xivapi.com) - Item data, recipes, character info
- **Universalis** (https://universalis.app) - Market board data

Replace the mock `searchRecipes` function in `src/App.jsx` with actual API calls.

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own FFXIV tools.

## Acknowledgments

- XIVAPI for providing comprehensive FFXIV data
- Universalis for market board data
- The FFXIV community for inspiration
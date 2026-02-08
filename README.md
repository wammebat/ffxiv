# FFXIV Companion - Modular Webapp

A highly modular, customizable webapp for tracking FFXIV content (relics, inventory, crafting, etc.) with plans to expand to multiple games and real-world applications.

## 🎯 Project Overview

This project is designed to be:
- **Modular**: Easy to add new game modules or features
- **Scalable**: Built with future database integration in mind
- **Offline-capable**: Works with localStorage while database is being set up
- **Developer-friendly**: Clear code structure with extensive comments

## 📁 Project Structure

```
project/
├── index-modular.html      # Main HTML file (use this for development)
├── style.css               # Base styles (Teamcraft-inspired)
├── style-extended.css      # Additional styles for new features
│
├── config.js               # Configuration & environment variables
├── data-layer.js           # Data persistence (localStorage/AWS RDS)
├── api-service.js          # External API integration
├── ui-helpers.js           # UI utilities (notifications, modals, etc.)
│
├── module-manager.js       # Game module selection system
├── ffxiv-module.js         # FFXIV-specific functionality
│
├── app-main.js             # Application bootstrap
│
└── create_tables.sql       # Database schema (for AWS RDS)
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- VSCode with Live Server extension (for local development)
- (Future) Node.js for build process

### Quick Start

1. **Clone/Download the project**

2. **Open in VSCode**
   ```bash
   code .
   ```

3. **Start Live Server**
   - Right-click on `index-modular.html`
   - Select "Open with Live Server"
   - Your browser will open with the app

4. **That's it!** The app will work entirely in your browser using localStorage.

## 🔧 Configuration

### Environment Variables (Future)

Create a `.env` file in the root directory:

```env
# AWS RDS Configuration
AWS_RDS_ENDPOINT=your-database-endpoint.rds.amazonaws.com
AWS_RDS_USERNAME=your-username
AWS_RDS_PASSWORD=your-password
AWS_RDS_DATABASE=ffxiv_companion

# API Keys (if needed in the future)
FFXIV_API_KEY=your-api-key-here

# Environment
NODE_ENV=development
```

### Current Configuration

For now, all configuration is in `config.js`. Key settings:

```javascript
Config.database.useLocalStorage = true  // Currently using localStorage
Config.features.enableDatabase = false  // Database not yet configured
Config.features.enableMultiModule = true // Multiple game modules enabled
```

## 🎮 Features

### Current Features
✅ Modular architecture with game module selection
✅ FFXIV Relic Tracker
  - Track relics across all expansions
  - Filter by expansion, job, or collection status
  - Add personal notes
  - Visual progress tracking

✅ Data persistence (localStorage)
✅ Export/Import data (JSON backup)
✅ Responsive design
✅ Dark theme UI
✅ Keyboard shortcuts
✅ Settings panel

### In Development
🚧 Database integration (AWS RDS)
🚧 Additional FFXIV modules (gathering, crafting, collections)
🚧 API integration (Universalis, XIVAPI)
🚧 User authentication
🚧 Stock tracking module

### Planned
📋 Multiple game modules
📋 Real-time market data
📋 Craft optimization
📋 Light/dark theme toggle
📋 Mobile app version

## 📊 Data Management

### Current Storage (localStorage)

All data is stored in your browser's localStorage:
- `ffxiv_relics` - Relic tracking data
- `app_user_preferences` - User settings
- `cache_*` - API response cache

### Future Storage (AWS RDS)

When database is configured, the app will:
1. Detect database availability
2. Migrate data from localStorage
3. Sync across devices
4. Enable multi-user features

## 🔌 API Integration

### Configured APIs

1. **Universalis** (Market Board Data)
   - Endpoint: `https://universalis.app/api/v2`
   - Rate limit: 20 requests/minute
   - Cached: 5 minutes

2. **XIVAPI** (Game Data)
   - Endpoint: `https://xivapi.com`
   - Rate limit: 20 requests/minute
   - Cached: 24 hours

3. **FFXIV Collect** (Collections)
   - Endpoint: `https://ffxivcollect.com/api`
   - Rate limit: 20 requests/minute
   - Cached: 24 hours

### Using the APIs

```javascript
// Get market data
const marketData = await ApiService.Universalis.getMarketData('Crystal', 12345);

// Search items
const items = await ApiService.XIVAPI.searchItems('Potion');

// Get mounts
const mounts = await ApiService.FFXIVCollect.getMounts();
```

## 🏗️ Adding a New Module

1. Create a new module file (e.g., `new-game-module.js`):

```javascript
const NewGameModule = {
    id: 'new-game',
    initialized: false,
    
    async init() {
        console.log('[NewGameModule] Initializing...');
        this.setupUI();
        this.initialized = true;
    },
    
    setupUI() {
        const container = document.getElementById('page-content');
        container.innerHTML = `<h1>New Game Module</h1>`;
    },
    
    async cleanup() {
        this.initialized = false;
    }
};
```

2. Add to `config.js`:

```javascript
Config.modules.newGame = {
    id: 'new-game',
    name: 'New Game',
    enabled: true,
    icon: '🎮',
    description: 'Track stuff for new game',
    features: ['feature1', 'feature2']
};
```

3. Add to `module-manager.js`:

```javascript
case 'new-game':
    moduleInstance = await this.loadNewGameModule();
    break;
```

4. Include script in `index-modular.html`:

```html
<script src="new-game-module.js"></script>
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + S` - Save (shows auto-save notification)
- `Escape` - Close modals/popups

## 🎨 Customization

### Changing Colors

Edit `style.css` variables:

```css
:root {
    --accent-primary: #4db8a8;  /* Main accent color */
    --bg-dark: #041e25;          /* Background color */
    /* ... more variables */
}
```

### Adding New Styles

Add to `style-extended.css` to keep customizations separate from base styles.

## 🐛 Troubleshooting

### Data Not Saving
- Check browser console for errors
- Ensure localStorage is enabled
- Try clearing cache and refreshing

### Module Not Loading
- Check console for errors
- Verify module is enabled in `config.js`
- Ensure all scripts are loaded in correct order

### API Errors
- Check network tab in devtools
- Verify API endpoints are accessible
- Check rate limit hasn't been exceeded

## 📝 Development Guidelines

### Code Style
- Use clear, descriptive variable names
- Add comments explaining complex logic
- Keep functions small and focused
- Follow existing code patterns

### Committing Changes
- Test thoroughly before committing
- Document major changes in comments
- Update this README if adding features

### Adding Features
1. Plan the feature (write it down)
2. Identify which files need changes
3. Implement with comments
4. Test in multiple browsers
5. Update documentation

## 🔒 Security Notes

- Never commit `.env` files
- Don't store sensitive data in localStorage
- Sanitize all user inputs
- Use prepared statements for database queries (when implemented)

## 📈 Performance Tips

- API responses are cached automatically
- Use debouncing for search/filter inputs
- Lazy load modules as needed
- Keep localStorage data minimal

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Test your changes in Live Server
2. Ensure no console errors
3. Check responsive design
4. Document new features

## 📜 License

Personal project - All rights reserved

## 🙏 Acknowledgments

Design inspired by:
- [FFXIV Collect](https://ffxivcollect.com)
- [FFXIV Teamcraft](https://ffxivteamcraft.com/)
- [Universalis](https://universalis.app/)

APIs used:
- Universalis (market data)
- XIVAPI (game data)
- FFXIV Collect (collections)

## 📞 Support

For issues or questions:
1. Check the console for errors
2. Review this README
3. Check the code comments
4. Search for similar issues online

---

**Version**: 1.0.0  
**Last Updated**: 2025-02-07  
**Status**: Active Development

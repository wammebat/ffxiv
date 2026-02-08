# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Files You Need
Make sure you have these files in your project folder:
- `index-modular.html` ← **This is your main file**
- `style.css`
- `style-extended.css`
- `config.js`
- `data-layer.js`
- `api-service.js`
- `ui-helpers.js`
- `module-manager.js`
- `ffxiv-module.js`
- `app-main.js`

### Step 2: Open in VSCode
```bash
cd your-project-folder
code .
```

### Step 3: Start Live Server
1. Right-click on `index-modular.html`
2. Click "Open with Live Server"
3. Your browser will open automatically

**That's it!** You're now running the app.

---

## 🎮 First Time Using the App

### What You'll See
1. **Module Selector** (if multiple modules enabled) or directly to FFXIV
2. **Dark themed interface** with sidebar navigation
3. **Relic Tracker** page by default

### Try These Features
1. **Check a relic** - Click the checkbox to mark it as collected
2. **Add notes** - Click in the notes field and type
3. **Filter relics** - Use the dropdown filters
4. **Collapse sidebar** - Click the arrow at the bottom of the sidebar
5. **Open settings** - Click the gear icon in the top-right

---

## 💾 Where Is My Data?

Your data is stored in your **browser's localStorage**. This means:
- ✅ No internet required
- ✅ Data persists when you close the browser
- ✅ Private to your browser
- ⚠️ Clearing browser data will delete your progress

**Backup Your Data:**
1. Click the settings icon (top-right)
2. Click "Export Data"
3. Save the JSON file somewhere safe

---

## 🔧 Common Customizations

### Change the Default Module
Edit `config.js`, line ~97:
```javascript
defaultModule: 'ffxiv',  // Change to your preferred module
```

### Disable Module Selector
Edit `config.js`, line ~34:
```javascript
enableMultiModule: false  // Will go directly to default module
```

### Change Color Scheme
Edit `style.css`, starting at line ~10:
```css
--accent-primary: #4db8a8;  /* Change this color */
```

---

## 🐛 Troubleshooting

### Nothing Appears / Blank Page
1. Open browser console (F12)
2. Check for red errors
3. Verify all script files are in the same folder
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Data Not Saving
1. Check if localStorage is enabled in browser
2. Open console and type: `localStorage`
3. If error appears, enable localStorage in browser settings

### Module Not Loading
1. Check console for errors
2. Verify the module is enabled in `config.js`
3. Make sure all JavaScript files are loading (check Network tab)

---

## 📚 Next Steps

### Explore the Code
- **config.js** - All settings and feature flags
- **ffxiv-module.js** - FFXIV-specific features
- **data-layer.js** - How data is saved/loaded
- **ui-helpers.js** - Notification, modal, and UI utilities

### Add Features
1. Check the commented sections in navigation (index-modular.html)
2. Implement pages for disabled features
3. Add new data types in data-layer.js

### Connect to Database (Advanced)
1. Set up AWS RDS PostgreSQL database
2. Run the SQL in `create_tables.sql`
3. Add credentials to `.env` file
4. Enable database in config.js

---

## 🎯 File Purpose Quick Reference

| File | Purpose |
|------|---------|
| `index-modular.html` | Main HTML structure |
| `style.css` | Base visual styles |
| `style-extended.css` | New feature styles |
| `config.js` | App configuration |
| `data-layer.js` | Data storage/retrieval |
| `api-service.js` | External API calls |
| `ui-helpers.js` | UI utilities |
| `module-manager.js` | Game module switching |
| `ffxiv-module.js` | FFXIV features |
| `app-main.js` | Application bootstrap |

---

## 💡 Tips

1. **Use Browser DevTools** - Press F12 to see console logs and debug
2. **Export Often** - Backup your data regularly
3. **Check Console** - Most issues will show errors in the console
4. **Read Comments** - Code has extensive comments explaining logic

---

## ✨ You're Ready!

Start tracking your FFXIV relics and enjoy the app. Check the main README.md for detailed documentation.

**Need Help?**
- Check browser console for errors
- Read the full README.md
- Review code comments

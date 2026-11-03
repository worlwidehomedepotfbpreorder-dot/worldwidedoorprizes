# Worldwide 50 Years Door Prize Slot Machine

This is a static app for GitHub Pages or Vercel.

## Files
- `index.html` — app interface
- `style.css` — styles and animations
- `script.js` — draws, prize management, and browser storage
- `vercel.json` — static hosting configuration

## Start
Open `index.html` in a browser, or serve these files from a static host. The app **starts with an empty prize list**. Click **Manage Prizes** to add your own Blue, Gold, or Red prizes. Prize names are optional. Prize numbering begins at #1.

## Deploy
Upload the **contents** of this folder to the root of a public GitHub repository. For Vercel, import that repository and deploy as a static project (no framework and no build command).

## Data
Prizes and draw history are stored in the current browser's localStorage, not in Vercel or GitHub. Export Backup before changing browsers or devices. This version uses a new localStorage key so older sample prize lists do not appear on a new setup. To migrate a previous real prize list, use Export Backup in the old version and Import Backup here.

## Offline
After downloading or extracting all files to the same folder, double-click `index.html` to run it in a desktop browser.

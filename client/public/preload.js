// In the app, if window.isElectron is defined and true, we know we're running in Electron
console.log(`In preload.js`);
Object.defineProperty(window, "isElectron", { get: () => true });
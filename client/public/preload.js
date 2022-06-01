// In the app, if window.isElectron is defined and true, we know we're running in Electron
Object.defineProperty(window, "isElectron", { get: () => true });
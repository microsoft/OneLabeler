export {};

declare global {
  interface Window {
    isElectron: boolean,
  }
}
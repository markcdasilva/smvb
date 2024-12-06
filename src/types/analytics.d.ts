declare global {
    interface Window {
      _learnq: any[];
      gtag: (...args: any[]) => void;
    }
  }
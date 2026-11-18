/// <reference types="vite/client" />

declare global {
  interface Window {
    sazibApi?: {
      openGoogleLogin: () => Promise<void>;
      openOttWindow: (data: { url: string; title?: string }) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    webview: any;
  }
}

export {};

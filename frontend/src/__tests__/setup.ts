import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

// Mock crypto.subtle for content hashing tests
Object.defineProperty(globalThis, "crypto", {
  value: {
    subtle: {
      digest: async (_algorithm: string, data: ArrayBuffer) => {
        // Simple mock that returns a consistent hash for testing
        const text = new TextDecoder().decode(data);
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
        }
        const hashArray = new Uint8Array(32);
        for (let i = 0; i < 8; i++) {
          hashArray[i] = (hash >> (i * 4)) & 0xff;
        }
        return hashArray.buffer;
      },
    },
    randomUUID: () =>
      `test-uuid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  },
});

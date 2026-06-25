import '@testing-library/jest-dom';

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) { return store[key] || null; },
    setItem: function (key: string, value: string) { store[key] = value.toString(); },
    removeItem: function (key: string) { delete store[key]; },
    clear: function () { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'sessionStorage', { value: localStorageMock });

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

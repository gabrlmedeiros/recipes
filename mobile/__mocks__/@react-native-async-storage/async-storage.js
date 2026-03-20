/* eslint-disable @typescript-eslint/no-require-imports */
const store = new Map();

const AsyncStorageMock = {
  getItem: jest.fn((key) => Promise.resolve(store.has(key) ? store.get(key) : null)),
  setItem: jest.fn((key, value) => Promise.resolve(store.set(key, value))),
  removeItem: jest.fn((key) => Promise.resolve(store.delete(key))),
  clear: jest.fn(() => Promise.resolve(store.clear())),
  getAllKeys: jest.fn(() => Promise.resolve(Array.from(store.keys()))),
};

module.exports = AsyncStorageMock;

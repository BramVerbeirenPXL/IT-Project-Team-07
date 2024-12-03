// jest-dom adds custom jest matchers for asserting on DOM nodes
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Fix for TextEncoder, TextDecoder, and ReadableStream
import { TextEncoder, TextDecoder, ReadableStream } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

// Mock fetch
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Mock canvas for Leaflet
import 'jest-canvas-mock';


// Leaflet Icon Mock
import L from 'leaflet';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'mockIcon',
  iconUrl: 'mockIcon',
  shadowUrl: 'mockIcon',
});

// Fix Jest's handling of `window.matchMedia`
window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
}));

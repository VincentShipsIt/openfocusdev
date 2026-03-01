// Polyfill for react-dom/test-utils in React 19 + bun environments.
// React 19 removed act from react-dom/test-utils; it now lives in 'react'.
export { act } from 'react';

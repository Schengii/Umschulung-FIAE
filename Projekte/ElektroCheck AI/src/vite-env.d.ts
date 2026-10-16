/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.css?inline' {
  const content: string;
  export default content;
}
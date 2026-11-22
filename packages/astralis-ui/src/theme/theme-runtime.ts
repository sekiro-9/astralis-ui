/*
 * Run-time theming: everything the client provider needs to turn a seed into
 * CSS variables in the browser. The provider-client module reaches it only
 * through import(), so the theme maths stays out of an app's client bundle
 * until a seed is chosen with setTokens or restored from storage.
 * check-server-safe.mjs fails the build if a static import brings it back.
 */

export { generateThemeTokens } from "./css-vars";
export { readStoredSeed, storedThemeCss } from "./theme-token-storage";

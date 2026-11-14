// Sister-service address. Local dev points at the local OTT; builds point at the deployed page.
// Set VITE_OTT_URL to override either.
export const OTT_URL: string =
  import.meta.env.VITE_OTT_URL ??
  (import.meta.env.DEV ? 'http://localhost:5174' : 'https://greycity1988.github.io/omni-trend-tracker/');

// Sister-service address. Local dev points at the local OTT; builds point at the deployed page.
// Set VITE_OTT_URL to override either.
export const OTT_URL: string =
  import.meta.env.VITE_OTT_URL ??
  (import.meta.env.DEV ? 'http://localhost:5174' : 'https://greycity1988.github.io/omni-trend-tracker/');

// The public OTT page has no hosted backend yet, so its searches fail. Show the header
// button only in local dev, or in a build made with VITE_SHOW_OTT=true once OTT is live.
export const SHOW_OTT_LINK: boolean = import.meta.env.DEV || import.meta.env.VITE_SHOW_OTT === 'true';

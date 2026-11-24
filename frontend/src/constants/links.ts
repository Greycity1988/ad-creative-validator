// Sister-service address. Local dev points at local ports; builds point at deployed pages.
export const ACV_URL: string =
  import.meta.env.VITE_ACV_URL ??
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://ad-creative-validator.vercel.app');

export const CAL_URL: string =
  import.meta.env.VITE_CAL_URL ??
  (import.meta.env.DEV ? 'http://localhost:5175' : 'https://greycity1988.github.io/competitive-ad-lens/');

export const OTT_URL: string =
  import.meta.env.VITE_OTT_URL ??
  (import.meta.env.DEV ? 'http://localhost:5174' : 'https://omni-trend-tracker.vercel.app');

export const BEP_URL: string =
  import.meta.env.VITE_BEP_URL ??
  (import.meta.env.DEV ? 'http://localhost:5176' : 'https://bep-master.vercel.app');

export const CFR_URL: string =
  import.meta.env.VITE_CFR_URL ??
  (import.meta.env.DEV ? 'http://localhost:5177' : ''); // not deployed yet: shown as in development

export const KO_FI_URL: string = 'https://ko-fi.com/greycity1988';
export const SHOW_OTT_LINK: boolean = import.meta.env.DEV || import.meta.env.VITE_SHOW_OTT === 'true';

const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://webflux-production-e654.up.railway.app";

const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export default API_URL;
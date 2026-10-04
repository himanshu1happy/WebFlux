const API_URL = import.meta.env.DEV
  ? ""
  : (
      import.meta.env.VITE_API_URL ||
      "https://webflux-production-e654.up.railway.app"
    ).replace(/\/+$/, "");

export default API_URL;
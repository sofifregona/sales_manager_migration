const HOST = (import.meta.env.VITE_API_HOST as string)?.replace(/\/$/, "");
const PORT = import.meta.env.VITE_API_PORT
  ? `:${import.meta.env.VITE_API_PORT}`
  : "";
const BASE_PATH = (
  (import.meta.env.VITE_API_BASE_PATH as string) || "/api"
).replace(/\/$/, "");

// Backwards-compatible base (host:port)
export const VITE_API_URL = `${HOST}${PORT}`;

// Preferred: host:port + versioned base path (e.g., /api/v1)
export const API_BASE_URL = `${HOST}${PORT}${BASE_PATH}`;

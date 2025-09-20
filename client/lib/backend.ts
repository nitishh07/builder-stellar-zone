export function getBackendUrl() {
  const env = (import.meta as any).env || {};
  return (env.VITE_BACKEND_URL as string) || "https://builder-stellar-zone-2.onrender.com";
}

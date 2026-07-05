export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getErrorMsg = (data: any, defaultMsg: string): string => {
  if (!data) return defaultMsg;
  const detail = data.detail || data;
  if (!detail) return defaultMsg;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => {
      const field = Array.isArray(e.loc) ? e.loc.slice(1).join('.') : e.loc;
      return field ? `${field}: ${e.msg}` : e.msg;
    }).join(', ');
  }
  if (typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return String(detail);
};

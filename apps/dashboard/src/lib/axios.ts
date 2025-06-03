import axios from "axios";
import { clerkAccessTokenAtom } from "../store/clerkAccessToken.atom";
import { getDefaultStore } from "jotai";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "",
});

api.interceptors.request.use((config) => {
  const store = getDefaultStore();
  const token = store.get(clerkAccessTokenAtom);

  console.log("[axios interceptor] Access token:", token);
  if (token) {
    config.headers = config.headers || {};
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

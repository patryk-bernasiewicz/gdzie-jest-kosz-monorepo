import axios from "axios";
import { clerkAccessTokenAtom } from "../store/clerkAccessToken.atom";
import { getDefaultStore } from "jotai";

// In the future, if the api version is updated, we can create another instance of axios with the different prefix
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || ""}/api/v1`,
});

api.interceptors.request.use((config) => {
  const store = getDefaultStore();
  const token = store.get(clerkAccessTokenAtom);

  if (token) {
    config.headers = config.headers || {};
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

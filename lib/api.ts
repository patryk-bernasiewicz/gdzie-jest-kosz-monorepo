import axios from "axios";
import { getDefaultStore } from "jotai";
import { authTokenAtom } from "@/store/authToken.atom";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = getDefaultStore().get(authTokenAtom);
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;

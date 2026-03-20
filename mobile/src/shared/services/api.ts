import axios from 'axios';
import { storage } from '../storage/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  const envUrl = process.env['EXPO_PUBLIC_API_URL'] || (Constants.expoConfig && (Constants.expoConfig.extra as any)?.API_URL);
  if (envUrl) return envUrl;

  const dbg = (Constants.manifest && (Constants.manifest as any).debuggerHost) || (Constants.manifest2 && (Constants as any).manifest2?.debuggerHost);
  if (dbg && typeof dbg === 'string') {
    const host = dbg.split(':')[0];
    return `http://${host}:3000`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

import { getClerkInstance } from '@clerk/clerk-expo';

import { useAuthToken } from '../hooks/useAuthToken';

let cachedToken: string | null = null;
let cachedAt: number | null = null;
const TOKEN_CACHE_TTL = 30 * 1000;

async function getCachedClerkToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedAt && now - cachedAt < TOKEN_CACHE_TTL) {
    return cachedToken;
  }
  return null;
}

export async function fetchAndSetClerkToken() {
  const clerkInstance = getClerkInstance();

  try {
    let token: string | null;
    token = await getCachedClerkToken();
    if (!token) {
      // Check if we have an active session before trying to get token
      if (!clerkInstance.session) {
        console.warn('[fetchAndSetClerkToken] No active session available.');
        useAuthToken.setState({ token: null });
        return null;
      }

      token =
        (await clerkInstance.session?.getToken({
          skipCache: true,
        })) || null;

      if (token) {
        cachedToken = token;
        cachedAt = Date.now();
        useAuthToken.setState({ token });
      } else {
        console.warn('[fetchAndSetClerkToken] Token fetch returned null.');
        useAuthToken.setState({ token: null });
      }
    }

    return token;
  } catch (error) {
    console.error('[fetchAndSetClerkToken] Error fetching Clerk token:', error);
    useAuthToken.setState({ token: null });
    return null;
  }
}

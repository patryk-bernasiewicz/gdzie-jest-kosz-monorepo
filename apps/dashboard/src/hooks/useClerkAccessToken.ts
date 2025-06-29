import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { clerkAccessTokenAtom } from '../store/clerkAccessToken.atom';
import { useAuth } from '@clerk/clerk-react';

const ACCESS_TOKEN_REFRESH_INTERVAL = 1000 * 60;

export const useClerkAccessToken = () => {
  const setAccessToken = useSetAtom(clerkAccessTokenAtom);
  const { getToken } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setTimeout>;

    const fetchToken = async () => {
      const token = await getToken();
      if (isMounted) {
        setAccessToken(token ?? null);
        console.log(
          '[useClerkAccessToken] Refreshed and updated access token in store:',
          token,
        );
      }
    };

    void fetchToken();
    // eslint-disable-next-line prefer-const
    intervalId = setInterval(fetchToken, ACCESS_TOKEN_REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [getToken, setAccessToken]);
};

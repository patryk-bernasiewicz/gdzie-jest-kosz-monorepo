import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";

export default function useClerkToken() {
  const { getToken, isLoaded } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchToken() {
      setLoading(true);
      setError(null);
      try {
        const fetchedToken = await getToken();
        if (isMounted) {
          setToken(fetchedToken ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    if (isLoaded) {
      fetchToken();
    } else {
      setToken(null);
      setLoading(true);
    }
    return () => {
      isMounted = false;
    };
  }, [getToken, isLoaded]);

  return { token, loading, error };
}

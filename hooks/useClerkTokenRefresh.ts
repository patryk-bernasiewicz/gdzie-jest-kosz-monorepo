import { authTokenAtom } from "@/store/authToken.atom";
import { useSession } from "@clerk/clerk-expo";
import { useAtom } from "jotai";
import { useEffect } from "react";

const refreshTokenInterval = 1000 * 60 * 3; // 5 minutes

export default function useClerkTokenRefresh() {
  const { session } = useSession();
  const [currentToken, setAuthToken] = useAtom(authTokenAtom);

  useEffect(() => {
    if (!session) return;

    (async () => {
      const token = await session.getToken();
      if (token) {
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    })();
  }, [session?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        if (!session) return;

        const token = await session.getToken();
        if (token) {
          setAuthToken(token);
        } else if (!currentToken) {
          setAuthToken(null);
        }
      })();
    }, refreshTokenInterval);

    return () => {
      clearInterval(interval);
    };
  }, []);
}

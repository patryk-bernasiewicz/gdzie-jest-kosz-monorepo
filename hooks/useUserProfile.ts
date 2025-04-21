import { User } from "@/types/User";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import useClerkToken from "./useClerkToken";

export default function useUserProfile() {
  const { user } = useUser();
  const { token, loading } = useClerkToken();

  return useQuery<User>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!user && !!token && !loading,
    refetchInterval: 1000 * 60 * 15,
  });
}

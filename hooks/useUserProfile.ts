import { User } from "@/types/User";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

export default function useUserProfile() {
  const { user } = useUser();
  const clerkId = user?.id;

  return useQuery<User>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/me?clerkId=${clerkId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!clerkId,
    refetchInterval: 1000 * 60 * 15,
  });
}

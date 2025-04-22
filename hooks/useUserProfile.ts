import { User } from "@/types/User";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function useUserProfile() {
  const { user } = useUser();

  return useQuery<User>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/user/me");
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 1000 * 60 * 15,
  });
}

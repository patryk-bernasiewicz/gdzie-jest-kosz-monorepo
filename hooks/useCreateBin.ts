import { Bin } from "@/types/Bin";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export default function useCreateBin() {
  const user = useUser();
  const clerkId = user?.user?.id;
  const queryClient = useQueryClient();

  const createBin = useMutation<Bin, Error, [number, number]>({
    mutationKey: ["createBin"],
    mutationFn: async (location: [number, number]) => {
      try {
        const [latitude, longitude] = location;

        const res = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/bins?clerkId=${clerkId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude,
              longitude,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        queryClient.invalidateQueries({ queryKey: ["bins"] });
        Toast.show({
          type: "success",
          text1: "Kosz został dodany",
          text2: "Twój kosz pokaże się po zaakceptowaniu przed administratora.",
        });

        return res.json();
      } catch (error) {
        console.error("Error creating bin:", error);
        throw error;
      }
    },
  });

  return createBin;
}

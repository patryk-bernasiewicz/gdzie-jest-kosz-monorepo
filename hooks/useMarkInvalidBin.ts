import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import useClerkToken from "./useClerkToken";

export default function useMarkInvalidBin() {
  const { token } = useClerkToken();

  const markInvalidBin = useMutation<void, Error, number>({
    mutationKey: ["markInvalidBin"],
    mutationFn: async (binId) => {
      try {
        // const res = await fetch(
        //   `${process.env.EXPO_PUBLIC_BACKEND_URL}/bins/${binId}/invalid`,
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );

        const res = await Promise.resolve({ ok: true });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        Toast.show({
          type: "success",
          text1: "Kosz został oznaczony jako nieprawidłowy",
        });
      } catch (error) {
        console.error("Error marking bin as invalid:", error);
        throw error;
      }
    },
  });

  return markInvalidBin;
}

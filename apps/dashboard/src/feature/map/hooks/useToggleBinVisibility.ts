import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { AxiosError } from "axios";
import { Bin } from "../Bin";

type ToggleVisibilityParams = {
  binId: number;
  visibility: boolean;
};

type ToggleVisibilityResponse = Bin;

export const useToggleBinVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation<ToggleVisibilityResponse, Error, ToggleVisibilityParams>({
    mutationFn: async ({ binId, visibility }) => {
      try {
        const { data } = await api.put<ToggleVisibilityResponse>(
          `/bins/admin/${binId}/visibility`,
          { visibility },
        );
        return data;
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        throw new Error("Failed to toggle bin visibility");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bins"] });
    },
  });
};

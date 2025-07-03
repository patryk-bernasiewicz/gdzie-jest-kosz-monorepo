import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { AxiosError } from "axios";
import { Bin } from "../Bin";

type UpdateBinLocationParams = {
  binId: number;
  latitude: number;
  longitude: number;
};

type UpdateBinLocationResponse = Bin;

export const useUpdateBinLocation = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateBinLocationResponse, Error, UpdateBinLocationParams>(
    {
      mutationFn: async ({ binId, latitude, longitude }) => {
        try {
          const { data } = await api.put<UpdateBinLocationResponse>(
            `/bins/admin/${binId}/location`,
            { latitude, longitude },
          );

          return data;
        } catch (error) {
          const err = error as AxiosError<{ message?: string }>;
          if (err.response?.data?.message) {
            throw new Error(err.response.data.message);
          }
          throw new Error("Failed to update bin location");
        }
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["bins"] });
      },
    },
  );
};

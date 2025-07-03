import { useMutation } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

type CreateBinParams = {
  latitude: number;
  longitude: number;
};

type CreateBinResponse = {
  id: string;
  latitude: number;
  longitude: number;
  acceptedAt?: string;
};

export const useCreateBin = () => {
  return useMutation<CreateBinResponse, Error, CreateBinParams>({
    mutationFn: async ({ latitude, longitude }) => {
      try {
        const { data } = await api.post<CreateBinResponse>("bins/admin", {
          latitude,
          longitude,
        });
        return data;
      } catch (error: unknown) {
        const msg = extractApiErrorMessage(error);
        if (msg) {
          throw new Error(msg);
        }
        throw new Error("Failed to create bin");
      }
    },
  });
};

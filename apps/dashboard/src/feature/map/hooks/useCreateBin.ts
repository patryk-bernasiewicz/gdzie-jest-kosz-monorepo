import { useMutation } from "@tanstack/react-query";
import api from "../../../lib/axios";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          throw new Error(error.response.data.message);
        }
        throw new Error("Failed to create bin");
      }
    },
  });
};

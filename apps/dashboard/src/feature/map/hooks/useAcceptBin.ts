import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Bin } from '../Bin';

export const useAcceptBin = () => {
  const queryClient = useQueryClient();
  return useMutation<Bin, Error, number>({
    mutationFn: async (binId: number) => {
      try {
        const { data } = await api.put<Bin>(`/bins/admin/${binId}/accept`, { accept: true });
        return data;
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error('Failed to accept bin');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
}; 
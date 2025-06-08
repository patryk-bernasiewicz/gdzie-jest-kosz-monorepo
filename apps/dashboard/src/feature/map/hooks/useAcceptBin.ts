import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Bin } from '../Bin';
import { extractApiErrorMessage } from '../../../utils/extractApiErrorMessage';

export const useAcceptBin = () => {
  const queryClient = useQueryClient();
  return useMutation<Bin, Error, number>({
    mutationFn: async (binId: number) => {
      try {
        const { data } = await api.put<Bin>(`/bins/admin/${binId}/accept`, { accept: true });
        return data;
      } catch (error: unknown) {
        const msg = extractApiErrorMessage(error);
        if (msg) {
          throw new Error(msg);
        }
        throw new Error('Failed to accept bin');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
}; 
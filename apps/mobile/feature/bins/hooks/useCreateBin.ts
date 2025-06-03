import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import api from '@/utils/api';
import { serializeAxiosError } from '@/utils/serializeAxiosError';

import { Bin } from '../types';

export default function useCreateBin() {
  const queryClient = useQueryClient();

  const createBin = useMutation<Bin, Error, [number, number]>({
    mutationKey: ['createBin'],
    mutationFn: async (location: [number, number]) => {
      try {
        const [latitude, longitude] = location;

        const res = await api.post('/bins', {
          latitude,
          longitude,
        });

        await queryClient.invalidateQueries({ queryKey: ['bins'] });
        Toast.show({
          type: 'success',
          text1: 'Kosz został dodany',
          text2: 'Twój kosz pokaże się po zaakceptowaniu przed administratora.',
        });

        return res.data;
      } catch (error) {
        console.error('Error creating bin:', JSON.stringify(serializeAxiosError(error), null, 2));
        throw error;
      }
    },
  });

  return createBin;
}

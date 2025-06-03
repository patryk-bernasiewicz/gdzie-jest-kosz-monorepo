import { useUser } from '@clerk/clerk-expo';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import api from '@/utils/api';
import { serializeAxiosError } from '@/utils/serializeAxiosError';

import { User } from '../types';

export default function useUserProfile(
  options?: Partial<UseQueryOptions<User>>
): UseQueryResult<User> {
  const { user } = useUser();

  const results = useQuery<User>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/user/me');
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', JSON.stringify(serializeAxiosError(error), null, 2));
        throw error;
      }
    },
    enabled: Boolean(user),
    refetchInterval: 1000 * 60 * 15,
    ...options,
  });

  return results;
}

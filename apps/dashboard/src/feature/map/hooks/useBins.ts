import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Bin } from '../Bin';

const fetchBins = async (latitude: number, longitude: number) => {
  const { data } = await api.get<Bin[]>('/bins/admin', {
    params: { latitude, longitude },
  });
  return data;
};

const roundCoord = (value: number, decimals = 3) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

export const useBins = (latitude: number, longitude: number) => {
  const roundedLat = roundCoord(latitude);
  const roundedLng = roundCoord(longitude);

  const { data } = useQuery({
    queryKey: ['bins', roundedLat, roundedLng],
    queryFn: () => fetchBins(latitude, longitude),
    enabled: !!latitude && !!longitude,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2000,
  });

  return data || [];
};

import { useQuery } from "@tanstack/react-query";
import useLocation from "./useLocation";

export default function useBins() {
  const location = useLocation();
  const binsUrl =
    location && location[0] && location[1]
      ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/bin/?latitude=${location[0]}&longitude=${location[1]}`
      : null;

  const bins = useQuery({
    queryKey: ["bins"],
    queryFn: async () => {
      if (!binsUrl) return null;
      const response = await fetch(binsUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!binsUrl,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  return bins;
}
// http://localhost:3220/bin?latitude=52.70521750799148&longitude=16.53047105237897
// http://localhost:3220/bin/?latitude=52.70521752331569&longitude=16.530471065069687
// http://localhost:3220/bin/?latitude=52.70521751600045&longitude=16.53047105901158

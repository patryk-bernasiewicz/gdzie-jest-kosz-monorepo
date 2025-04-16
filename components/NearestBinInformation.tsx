import { BinWithDistance } from "@/types/BinWithDistance";
import { View } from "react-native";
import Text from "./ui/Text";
import { WorldDirection } from "@/types/WorldDirection";
import { getColor } from "@/lib/getColor";

type NearestBinInformationProps = {
  nearestBin?: BinWithDistance | null;
  direction?: WorldDirection | null;
};

const fallbackText = "W pobliżu nie znaleziono kosza...";

const worldDirectionToLabel: Record<WorldDirection, string> = {
  north: "na północ stąd",
  northeast: "na północny wschód stąd",
  northwest: "na północny zachód stąd",
  south: "na południe stąd",
  east: "na wschód stąd",
  west: "na zachód stąd",
  southeast: "na południowy wschód stąd",
  southwest: "na południowy zachód stąd",
  here: ", obok Ciebie!",
};

export default function NearestBinInformation({
  nearestBin,
  direction,
}: NearestBinInformationProps) {
  const label =
    nearestBin && direction ? worldDirectionToLabel[direction || "here"] : null;
  const text =
    nearestBin && nearestBin.distance
      ? [
          `Najbliższy kosz jest ${nearestBin.distance} metrów`,
          label ?? undefined,
        ]
          .filter(Boolean)
          .join(" ")
      : fallbackText;

  return (
    <View
      style={{
        top: 0,
        paddingTop: 40,
        left: 0,
        right: 0,
        backgroundColor: getColor("background"),
        position: "absolute",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: getColor("text"),
          textAlign: "center",
          padding: 10,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

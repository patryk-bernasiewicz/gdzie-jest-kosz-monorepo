import useNearestBin from "@/hooks/useNearestBin";
import useUserProfile from "@/hooks/useUserProfile";
import { BinWithDistance } from "@/types/BinWithDistance";
import { StyleSheet, Text, View } from "react-native";

type BinsListProps = {
  bins: BinWithDistance[] | null;
};

function BinsList({ bins }: BinsListProps) {
  const nearestBin = useNearestBin(bins);
  const userProfile = useUserProfile();

  if (!userProfile.data?.role || userProfile.data?.role !== "admin") {
    return null;
  }

  if (!bins) {
    return <Text>No bins in the nearest area.</Text>;
  }

  return (
    <View style={styles.binList}>
      <Text>Total bins in area: {bins?.length ?? 0}</Text>
      {bins.map((bin) => {
        const isNearest = nearestBin === bin;

        return (
          <View key={bin.id}>
            <Text style={isNearest ? styles.nearestBin : undefined}>
              Bin ID: {bin.id} ({bin.distance} meters)
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  binList: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "white",
    fontSize: 9,
    padding: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    zIndex: 2,
  },
  nearestBin: {
    color: "green",
    fontWeight: "bold",
  },
});

export default BinsList;

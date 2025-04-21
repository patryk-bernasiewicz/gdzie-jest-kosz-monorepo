import useNearestBin from "@/hooks/useNearestBin";
import useUserProfile from "@/hooks/useUserProfile";
import { BinWithDistance } from "@/types/BinWithDistance";
import { StyleSheet, Text, View, ScrollView } from "react-native";

type BinsListProps = {
  bins: BinWithDistance[] | null;
};

function BinsList({ bins }: BinsListProps) {
  const { nearestBin, nearestBinDirection } = useNearestBin(bins);
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
      <View style={styles.scrollWrapper} pointerEvents="box-none">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0, flex: 0 }}
        >
          {bins.map((bin) => {
            const isNearest = nearestBin === bin;

            return (
              <View key={bin.id}>
                <Text style={isNearest ? styles.nearestBin : undefined}>
                  Bin ID: {bin.id} ({bin.distance} meters
                  {isNearest &&
                    nearestBinDirection &&
                    `, ${nearestBinDirection}`}
                  )
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  binList: {
    position: "absolute",
    top: 110,
    left: 10,
    backgroundColor: "white",
    fontSize: 9,
    padding: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    zIndex: 2,
    opacity: 0.5,
  },
  scrollWrapper: {
    maxHeight: 110,
    overflow: "scroll",
  },
  nearestBin: {
    color: "green",
    fontWeight: "bold",
  },
});

export default BinsList;

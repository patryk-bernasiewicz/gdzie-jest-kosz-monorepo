import useLocation from "@/hooks/useLocation";
import { getColor } from "@/lib/getColor";
import { View } from "react-native";
import TouchableOpacityButton from "@/components/ui/TouchableOpacityButton";

export default function OffsetControls() {
  const {
    moveOffsetSouth,
    moveOffsetNorth,
    moveOffsetEast,
    moveOffsetWest,
    resetOffset,
  } = useLocation();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        zIndex: 1,
        backgroundColor: getColor("background"),
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TouchableOpacityButton onPress={moveOffsetNorth} text="⬆️" />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TouchableOpacityButton onPress={moveOffsetWest} text="⬅️" />
        <TouchableOpacityButton onPress={moveOffsetSouth} text="⬇️" />
        <TouchableOpacityButton onPress={moveOffsetEast} text="➡️" />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TouchableOpacityButton onPress={resetOffset} text="🔃" />
      </View>
    </View>
  );
}

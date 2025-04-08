import { StyleSheet, Text, View } from "react-native";

import LeafletMap from "@/components/LeafletMap";

import useHeading from "@/hooks/useHeading";
import useLocation from "@/hooks/useLocation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function HomeScreen() {
  const location = useLocation();
  const heading = useHeading();

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <View style={styles.map}>
          <LeafletMap
            latitude={location?.[0]}
            longitude={location?.[1]}
            rotation={heading}
          />
        </View>
        <View style={styles.position}>
          <Text>
            Current position:{"\n"}
            {location ? `${location[0]}\n${location[1]}` : "none"}
            {"\n"}
            Heading:{"\n"}
            {heading !== null ? `${heading.toFixed(2)}°` : "none"}
          </Text>
        </View>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: "lightblue",
    borderWidth: 1,
    borderColor: "#f00",
    borderStyle: "solid",
    width: "100%",
  },
  position: {
    position: "absolute",
    bottom: 120,
    left: 20,
    zIndex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f00",
    borderStyle: "solid",
    padding: 10,
    borderRadius: 5,
  },
});

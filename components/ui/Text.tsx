import { Appearance, StyleSheet, Text as RNText } from "react-native";

const colorScheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
  text: {
    color: colorScheme === "dark" ? "#f0f0f0" : "#0f0f0f",
  },
});

type TextProps = React.ComponentProps<typeof RNText>;

export default function Text(props: TextProps) {
  return (
    <RNText
      style={{
        ...(typeof props.style === "object" ? props.style : {}),
        ...styles.text,
      }}
      {...props}
    />
  );
}

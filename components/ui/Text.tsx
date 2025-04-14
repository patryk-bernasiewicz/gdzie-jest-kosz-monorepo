import { Appearance, StyleSheet, Text as RNText } from "react-native";

const colorScheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
  text: {
    color: colorScheme === "dark" ? "#f0f0f0" : "#0f0f0f",
    lineHeight: 18,
  },
});

type TextProps = React.ComponentProps<typeof RNText>;

export default function Text(props: TextProps) {
  return (
    <RNText
      {...props}
      style={[
        styles.text,
        ...(Array.isArray(props.style) ? props.style : [props.style]),
      ]}
    />
  );
}

import { Appearance, Text } from "react-native";

type HeadingProps = React.ComponentProps<typeof Text> & {
  text: string;
};

const colorScheme = Appearance.getColorScheme();

export default function Heading({ text, ...textProps }: HeadingProps) {
  return (
    <Text
      {...textProps}
      style={{
        color: colorScheme === "dark" ? "#f0f0f0" : "#000000",
        fontWeight: "900",
        textAlign: "center",
        fontSize: 30,
        marginBottom: 20,
      }}
    >
      {text}
    </Text>
  );
}

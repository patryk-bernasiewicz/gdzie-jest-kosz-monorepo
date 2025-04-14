import { getColor } from "@/lib/getColor";
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
        color: getColor("heading"),
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

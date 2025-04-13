import {
  Appearance,
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  error?: string | null;
  label?: string;
};

const colorScheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 10,
  },
  wrapper: {
    borderWidth: 1,
    borderColor: colorScheme === "dark" ? "#333" : "#ccc",
    borderRadius: 4,
    padding: 10,
  },
  label: {
    fontSize: 11,
    color: colorScheme === "dark" ? "#f0f0f0" : "#666",
    marginBottom: 2,
  },
  input: {
    height: 30,
    color: colorScheme === "dark" ? "#fafafa" : "#999",
    fontSize: 16,
  },
  error: {
    marginTop: 1,
    marginBottom: 1,
  },
  errorText: {
    marginLeft: 10,
    marginRight: 10,
    color: "red",
    fontSize: 12,
  },
});

export default function TextInput({
  error,
  label,
  ...inputProps
}: TextInputProps) {
  return (
    <View style={styles.outerWrapper}>
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <RNTextInput
          {...inputProps}
          style={[styles.input, error ? styles.error : null]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

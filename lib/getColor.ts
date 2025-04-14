import { Appearance } from "react-native";

const colorScheme = Appearance.getColorScheme();

const lightPalette = {
  text: "#0f0f0f",
  textDim: "#666666",
  heading: "#000000",
  border: "#cccccc",
  background: "#ffffff",
  error: "#f57251",
  primary: "#0274bd",
} as const;

const darkPalette = {
  text: "#f0f0f0",
  textDim: "#999999",
  heading: "#f0f0f0",
  border: "#333333",
  background: "#0f0f0f",
  error: "#f57251",
  primary: "#0274bd",
} as const;

export type PaletteKey = keyof typeof lightPalette;

export const getColor = (key: PaletteKey): string => {
  if (colorScheme === "dark") {
    return darkPalette[key];
  } else {
    return lightPalette[key];
  }
};

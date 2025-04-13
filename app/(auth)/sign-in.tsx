import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Appearance, StyleSheet, View } from "react-native";
import React from "react";
import Heading from "@/components/ui/Heading";
import TextInput from "@/components/ui/input/TextInput";
import TouchableOpacityButton from "@/components/ui/TouchableOpacityButton";
import Text from "@/components/ui/Text";

const colorScheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colorScheme === "dark" ? "#0f0f0f" : "#ffffff",
    flex: 1,
    padding: 20,
  },
});

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.wrapper}>
      <Heading text="Sign in" />
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        label="Email"
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        label="Password"
      />
      <TouchableOpacityButton
        onPress={onSignInPress}
        text="Continue"
        variant="primary"
      />
      <View
        style={{ display: "flex", flexDirection: "row", gap: 3, marginTop: 10 }}
      >
        <Text>Don't have an account?</Text>
        <Link href="/sign-up">
          <Text style={{ color: "#007bff", fontWeight: "bold" }}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

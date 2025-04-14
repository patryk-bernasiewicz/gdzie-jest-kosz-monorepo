import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import React from "react";
import Heading from "@/components/ui/Heading";
import TextInput from "@/components/ui/input/TextInput";
import TouchableOpacityButton from "@/components/ui/TouchableOpacityButton";
import Text from "@/components/ui/Text";
import { getColor } from "@/lib/getColor";
import useUpsertUser from "@/hooks/useUpsertUser";

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: getColor("background"),
    flex: 1,
    padding: 20,
  },
  link: {
    color: getColor("primary"),
    fontWeight: 600,
  },
});

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const upsertUser = useUpsertUser();

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
        if (signInAttempt.id) {
          await upsertUser.mutateAsync(signInAttempt.id);
        }

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
      <Heading text="Zaloguj się" />
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Adres e-mail"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        label="Adres e-mail"
      />
      <TextInput
        value={password}
        placeholder="Wpisz hasło"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        label="Hasło"
      />
      <TouchableOpacityButton
        onPress={onSignInPress}
        text="Kontynuuj"
        variant="primary"
      />
      <View
        style={{ display: "flex", flexDirection: "row", gap: 3, marginTop: 10 }}
      >
        <Text>Nie masz jeszcze konta?</Text>
        <Link href="/sign-up">
          <Text style={styles.link}>Zarejestruj się</Text>
        </Link>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text>Bezpieczne logowanie i rejestracja z systemem Clerk.</Text>
      </View>
    </View>
  );
}

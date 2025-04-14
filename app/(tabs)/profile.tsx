import { SignOutButton } from "@/components/SignOutButton";
import useUserProfile from "@/hooks/useUserProfile";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Href, Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    position: "relative",
    flex: 1,
    width: "100%",
    paddingTop: 150,
    paddingBottom: 50,
    paddingLeft: 20,
    paddingRight: 20,
    margin: 0,
  },
  link: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default function ProfileScreen() {
  const { user } = useUser();
  const userProfile = useUserProfile();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
        {userProfile.data && (
          <Text>
            User profile data: {userProfile.data.id}/{userProfile.data.clerkId}
          </Text>
        )}
      </SignedIn>
      <SignedOut>
        <Link style={styles.link} href={`/(auth)/sign-in` as Href}>
          <Text>Sign in</Text>
        </Link>
        <Link style={styles.link} href={`/(auth)/sign-up` as Href}>
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
      <Link href="/(auth)/privacy-policy">
        <Text>Polityka prywatności</Text>
      </Link>
    </View>
  );
}

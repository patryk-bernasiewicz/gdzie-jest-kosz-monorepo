import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { plPL } from '@clerk/localizations/pl-PL';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

// TODO: Verify if this is still relevant and necessary.
// eslint-disable-next-line no-undef
if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  window.navigator.onLine = true;
}

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. App may not work correctly.'
  );
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const currentRoute = segments.join('/');
    const isStrictAuthRoute =
      currentRoute.startsWith('(tabs)/sign-in') ||
      currentRoute.startsWith('(tabs)/sign-up');

    if (isSignedIn) {
      if (isStrictAuthRoute) {
        // Make sure we're using the correct route format
        try {
          router.navigate('/(tabs)/map');
        } catch (e) {
          // Fallback navigation if the first attempt fails
          router.navigate('/');
        }
      }
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey || 'temp_key_for_dev'}
      localization={plPL}
    >
      <QueryClientProvider client={queryClient}>
        <InitialLayout />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';

export default function Index() {
  const { isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }
  
  return <Redirect href="/(tabs)" />;
}


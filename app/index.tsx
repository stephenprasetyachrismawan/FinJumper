import { Redirect } from 'expo-router';

import { useAuth } from '@/core/providers/AuthProvider';

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Redirect href="/(public)/sign-in" />;
}

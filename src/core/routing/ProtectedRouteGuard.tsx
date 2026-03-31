import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/core/providers/AuthProvider';

export function ProtectedRouteGuard({ children }: PropsWithChildren) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return children;
}

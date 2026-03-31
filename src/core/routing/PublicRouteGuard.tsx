import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';

import { useAuth } from '@/core/providers/AuthProvider';

export function PublicRouteGuard({ children }: PropsWithChildren) {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return children;
}

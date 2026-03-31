import { Stack } from 'expo-router';

import { ProtectedRouteGuard } from '@/core/routing/ProtectedRouteGuard';

export default function AppLayout() {
  return (
    <ProtectedRouteGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRouteGuard>
  );
}

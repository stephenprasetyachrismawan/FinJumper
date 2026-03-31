import { Stack } from 'expo-router';

import { PublicRouteGuard } from '@/core/routing/PublicRouteGuard';

export default function PublicLayout() {
  return (
    <PublicRouteGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </PublicRouteGuard>
  );
}

import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/core/providers/AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}

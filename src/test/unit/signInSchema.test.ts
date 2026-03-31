import { describe, expect, it } from 'vitest';

import { signInSchema } from '@/features/auth/schemas/signInSchema';

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const parsed = signInSchema.safeParse({ email: 'valid@example.com', password: 'password1' });

    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const parsed = signInSchema.safeParse({ email: 'invalid', password: 'password1' });

    expect(parsed.success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema } from '@/features/auth/schemas/forgotPasswordSchema';
import { signUpSchema } from '@/features/auth/schemas/signUpSchema';

describe('auth schema validation', () => {
  it('rejects mismatched passwords', () => {
    const parsed = signUpSchema.safeParse({
      email: 'valid@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts valid forgot-password payload', () => {
    const parsed = forgotPasswordSchema.safeParse({ email: 'valid@example.com' });

    expect(parsed.success).toBe(true);
  });
});

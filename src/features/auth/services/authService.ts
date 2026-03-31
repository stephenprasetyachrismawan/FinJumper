import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '@/core/firebase/client';
import { ForgotPasswordFormValues } from '@/features/auth/schemas/forgotPasswordSchema';
import { SignInFormValues } from '@/features/auth/schemas/signInSchema';
import { SignUpFormValues } from '@/features/auth/schemas/signUpSchema';

export async function signIn(values: SignInFormValues) {
  return signInWithEmailAndPassword(auth, values.email, values.password);
}

export async function signUp(values: SignUpFormValues) {
  return createUserWithEmailAndPassword(auth, values.email, values.password);
}

export async function sendPasswordReset(values: ForgotPasswordFormValues) {
  return sendPasswordResetEmail(auth, values.email);
}

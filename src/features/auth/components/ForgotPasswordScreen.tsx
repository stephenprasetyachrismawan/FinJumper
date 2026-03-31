import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgotPasswordSchema';
import { sendPasswordReset } from '@/features/auth/services/authService';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await sendPasswordReset(values);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 24 }}>
      <Card>
        <View style={{ gap: 12, width: 320 }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Reset password</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={onChange}
                placeholder="Email"
                style={{ borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1, padding: 10 }}
                value={value}
              />
            )}
          />
          {errors.email ? <Text style={{ color: '#b91c1c' }}>{errors.email.message}</Text> : null}
          {isSubmitSuccessful ? (
            <Text style={{ color: '#065f46' }}>Password reset email sent.</Text>
          ) : null}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
            Send reset email
          </Button>
          <Link href="/(public)/sign-in" style={{ color: '#1d4ed8' }}>
            Back to sign in.
          </Link>
        </View>
      </Card>
    </View>
  );
}

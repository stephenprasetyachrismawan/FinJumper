import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import { signInSchema, SignInFormValues } from '@/features/auth/schemas/signInSchema';
import { signIn } from '@/features/auth/services/authService';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export function SignInScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    await signIn(values);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card>
        <View style={{ gap: 12, width: 320 }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Sign in</Text>
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
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                placeholder="Password"
                secureTextEntry
                style={{ borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1, padding: 10 }}
                value={value}
              />
            )}
          />
          {errors.password ? <Text style={{ color: '#b91c1c' }}>{errors.password.message}</Text> : null}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
            Continue
          </Button>
          <Link href="/(public)/forgot-password" style={{ color: '#1d4ed8' }}>
            Forgot password?
          </Link>
          <Link href="/(public)/sign-up" style={{ color: '#1d4ed8' }}>
            Need an account? Sign up.
          </Link>
        </View>
      </Card>
    </View>
  );
}

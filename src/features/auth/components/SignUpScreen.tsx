import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import { signUpSchema, SignUpFormValues } from '@/features/auth/schemas/signUpSchema';
import { signUp } from '@/features/auth/services/authService';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    await signUp(values);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 24 }}>
      <Card>
        <View style={{ gap: 12, width: 320 }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Create account</Text>
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
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                placeholder="Confirm password"
                secureTextEntry
                style={{ borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1, padding: 10 }}
                value={value}
              />
            )}
          />
          {errors.confirmPassword ? <Text style={{ color: '#b91c1c' }}>{errors.confirmPassword.message}</Text> : null}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
            Create account
          </Button>
          <Link href="/(public)/sign-in" style={{ color: '#1d4ed8' }}>
            Already have an account? Sign in.
          </Link>
        </View>
      </Card>
    </View>
  );
}

import { PropsWithChildren } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onPress?: () => void;
}>;

export function Button({ children, disabled = false, onPress }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? '#94a3b8' : '#1d4ed8',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>{children}</Text>
    </Pressable>
  );
}

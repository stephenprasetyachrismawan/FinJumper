import { Text, View } from 'react-native';

import { Card } from '@/shared/ui/Card';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f6f7fb', gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>FinJumper</Text>
      <Card>
        <Text style={{ fontSize: 16 }}>Dashboard foundation is ready.</Text>
      </Card>
    </View>
  );
}

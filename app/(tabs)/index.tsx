import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '@/libs/supabase';

export default function HomeScreen() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('bets').select('*');
      console.log('DATA:', data);
      console.log('ERROR:', error);
    };
    test();
  }, []);

  return (
    <View style={{ marginTop: 100 }}>
      <Text>Bets & Binouzes</Text>
    </View>
  );
}
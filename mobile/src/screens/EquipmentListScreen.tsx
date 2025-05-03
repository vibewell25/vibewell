import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EquipmentItem } from '../types/equipment';
import { equipmentApi } from '../services/equipmentService';
import { EquipmentListNavigationProp } from '../types/navigation';

const EquipmentListScreen: React?.FC = () => {
  const navigation = useNavigation<EquipmentListNavigationProp>();
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await equipmentApi?.getItems();
        setItems(data);
      } catch (err) {
        console?.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles?.container}>
      <Button title="Add Equipment" onPress={() => navigation?.navigate('EquipmentForm', {})} />
      <FlatList
        data={items}
        keyExtractor={item => item?.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles?.item}
            onPress={() => navigation?.navigate('EquipmentDetail', { id: item?.id })}
          >
            <Text style={styles?.title}>{item?.name}</Text>
            <Text>Serial: {item?.serialNumber || '-'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' }
});

export default EquipmentListScreen;

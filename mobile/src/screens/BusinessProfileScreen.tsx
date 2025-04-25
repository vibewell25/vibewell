import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BusinessProfileRouteProp, BusinessProfileNavigationProp } from '../types/navigation';

const BusinessProfileScreen: React.FC = () => {
  const route = useRoute<BusinessProfileRouteProp>();
  const navigation = useNavigation<BusinessProfileNavigationProp>();
  const { business } = route.params;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{business.name}</Text>
      {business.address ? <Text style={{ marginVertical: 4 }}>{business.address}</Text> : null}
      {business.description ? <Text style={{ marginBottom: 12 }}>{business.description}</Text> : null}
      <Button title="Edit Business" onPress={() => navigation.navigate('BusinessForm', { business })} />
      <View style={{ marginTop: 12 }}>
        <Button title="Manage Hours" onPress={() => navigation.navigate('BusinessHours', { business })} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Button title="Manage Staff" onPress={() => navigation.navigate('StaffList', { business })} />
      </View>
    </View>
  );
};

export default BusinessProfileScreen;

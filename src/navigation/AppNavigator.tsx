import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BreedListScreen from '../screens/BreedListScreen';
import BreedDetailScreen from '../screens/BreedDetailScreen';

export type RootStackParamList = {
  Breeds: undefined;
  BreedDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Breeds"
          component={BreedListScreen}
          options={{ title: 'Dog Breed Explorer' }}
        />
        <Stack.Screen
          name="BreedDetail"
          component={BreedDetailScreen}
          options={{ title: 'Breed Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

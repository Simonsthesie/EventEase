import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { EventListScreen } from '../screens/EventListScreen';
import { EventFormScreen } from '../screens/EventFormScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { Loading } from '../components/Loading';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="EventList" component={EventListScreen} />
          <Stack.Screen name="EventForm" component={EventFormScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

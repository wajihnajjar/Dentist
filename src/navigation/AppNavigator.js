import React, { useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, User, LayoutDashboard, Search } from 'lucide-react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import PatientLoginScreen from '../screens/auth/PatientLoginScreen';
import PatientRegisterScreen from '../screens/auth/PatientRegisterScreen';
import DentistLoginScreen from '../screens/auth/DentistLoginScreen';
import DentistRegisterScreen from '../screens/auth/DentistRegisterScreen';
import MapScreen from '../screens/patient/MapScreen';
import BookingScreen from '../screens/patient/BookingScreen';
import PatientDentistDetailScreen from '../screens/patient/PatientDentistDetailScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import PatientVisitHistoryScreen from '../screens/patient/PatientVisitHistoryScreen';
import PatientAppointmentDetailScreen from '../screens/patient/PatientAppointmentDetailScreen';
import PatientSettingsScreen from '../screens/patient/PatientSettingsScreen';

import CalendarScreen from '../screens/dentist/CalendarScreen';
import DentistDashboardScreen from '../screens/dentist/DentistDashboardScreen';
import DentistAccountScreen from '../screens/dentist/DentistAccountScreen';
import DentistPatientsScreen from '../screens/dentist/DentistPatientsScreen';
import DentistPatientDetailScreen from '../screens/dentist/DentistPatientDetailScreen';
import DentistAppointmentDetailScreen from '../screens/dentist/DentistAppointmentDetailScreen';
import DentistSettingsScreen from '../screens/dentist/DentistSettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BRAND = '#0d9488';
const BRAND_MUTED = '#94a3b8';

function tabScreenOptionsForInsets(insets) {
  return {
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: Math.max(insets.bottom, 12) + 2,
      height: 62 + Math.min(insets.bottom, 18),
      borderRadius: 28,
      borderTopWidth: 0,
      paddingTop: 6,
      paddingBottom: Math.max(insets.bottom - 6, 10),
      paddingHorizontal: 6,
      backgroundColor: 'rgba(255,255,255,0.88)',
      borderWidth: 1,
      borderColor: 'rgba(15, 23, 42, 0.07)',
      shadowColor: '#0c1222',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.09,
      shadowRadius: 28,
      elevation: 18,
    },
    tabBarActiveTintColor: BRAND,
    tabBarInactiveTintColor: BRAND_MUTED,
    tabBarLabelStyle: {
      fontWeight: '600',
      fontSize: 10,
      marginTop: 0,
      letterSpacing: 0.35,
      textTransform: 'uppercase',
    },
    tabBarItemStyle: { paddingTop: 6, paddingBottom: 2 },
  };
}

function PatientTabs() {
  const insets = useSafeAreaInsets();
  const screenOptions = useMemo(() => tabScreenOptionsForInsets(insets), [insets.bottom]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Explore"
        component={MapScreen}
        options={{ tabBarIcon: ({ color }) => <Search size={22} color={color} strokeWidth={2.25} /> }}
      />
      <Tab.Screen
        name="Bookings"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ color }) => <Calendar size={22} color={color} strokeWidth={2.25} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={PatientProfileScreen}
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.25} /> }}
      />
    </Tab.Navigator>
  );
}

function DentistTabs() {
  const insets = useSafeAreaInsets();
  const screenOptions = useMemo(() => tabScreenOptionsForInsets(insets), [insets.bottom]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Schedule"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ color }) => <Calendar size={22} color={color} strokeWidth={2.25} /> }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DentistDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} strokeWidth={2.25} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={DentistAccountScreen}
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2.25} /> }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="PatientLogin" component={PatientLoginScreen} />
    <Stack.Screen name="PatientRegister" component={PatientRegisterScreen} />
    <Stack.Screen name="DentistLogin" component={DentistLoginScreen} />
    <Stack.Screen name="DentistRegister" component={DentistRegisterScreen} />
    <Stack.Screen name="PatientTabs" component={PatientTabs} />
    <Stack.Screen name="DentistTabs" component={DentistTabs} />
    <Stack.Screen name="Booking" component={BookingScreen} />

    <Stack.Screen name="PatientVisitHistory" component={PatientVisitHistoryScreen} />
    <Stack.Screen name="PatientDentistDetail" component={PatientDentistDetailScreen} />
    <Stack.Screen name="PatientAppointmentDetail" component={PatientAppointmentDetailScreen} />
    <Stack.Screen name="PatientSettings" component={PatientSettingsScreen} />

    <Stack.Screen name="DentistPatients" component={DentistPatientsScreen} />
    <Stack.Screen name="DentistPatientDetail" component={DentistPatientDetailScreen} />
    <Stack.Screen name="DentistAppointmentDetail" component={DentistAppointmentDetailScreen} />
    <Stack.Screen name="DentistSettings" component={DentistSettingsScreen} />
  </Stack.Navigator>
);

export default AppNavigator;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../api/client';
import {
  Building2,
  Mail,
  Phone,
  ChevronRight,
  LogOut,
  Stethoscope,
  Settings,
  Users,
} from 'lucide-react-native';

const DentistAccountScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getMe();
        // Assuming backend returns { user: {...}, profile: {...} }
        setProfile({ ...res.profile, email: res.user?.email || res.email });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      const stack = navigation.getParent()?.getParent?.() ?? navigation.getParent();
      stack?.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="bg-slate-950 px-6 pb-16 rounded-b-[40px] border-b border-slate-800"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="absolute bottom-8 right-4 w-44 h-44 rounded-full bg-brand-500/10" />
        <Text className="text-brand-300/90 text-[11px] font-bold uppercase tracking-[2px]">Account</Text>
        <Text className="text-white text-[28px] font-bold mt-2 tracking-tight">Practice</Text>
        <Text className="text-slate-400 text-[14px] mt-2 leading-5">Workspace and clinic profile.</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 -mt-10"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-xl shadow-slate-900/8">
          <View className="flex-row items-start">
            <View className="bg-brand-600 w-16 h-16 rounded-[22px] items-center justify-center border border-brand-500/30 shadow-lg shadow-brand-900/20">
              <Stethoscope size={30} color="white" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-ink">{profile?.full_name || 'Loading...'}</Text>
              <View className="self-start bg-brand-50 px-3 py-1 rounded-full mt-2 border border-brand-100">
                <Text className="text-brand-800 text-[12px] font-bold">{profile?.practice_name || 'My Clinic'}</Text>
              </View>
            </View>
          </View>
      
          <View className="flex-row items-center mt-4">
            <Mail size={18} color="#64748b" />
            <Text className="text-slate-700 ml-3 flex-1 text-[15px]">{profile?.email || 'No email'}</Text>
          </View>
          <View className="flex-row items-center mt-4">
            <Phone size={18} color="#64748b" />
            <Text className="text-slate-700 ml-3 flex-1 text-[15px]">{profile?.phone || 'No phone'}</Text>
          </View>
        </View>

        <Text className="text-slate-500 text-[12px] font-bold uppercase tracking-wider mt-8 mb-2 px-2">Workspace</Text>
        <View className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
          <TouchableOpacity
            onPress={() => navigation.navigate('DentistSettings')}
            className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 active:bg-slate-50"
          >
            <View className="flex-row items-center">
              <View className="bg-brand-50 p-2.5 rounded-xl border border-brand-100/50">
                <Settings size={20} color="#0d9488" />
              </View>
              <Text className="text-ink font-semibold ml-3 text-[16px]">Clinic settings</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('DentistPatients')}
            className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50"
          >
            <View className="flex-row items-center">
              <View className="bg-brand-50 p-2.5 rounded-xl border border-brand-100/50">
                <Users size={20} color="#0d9488" />
              </View>
              <Text className="text-ink font-semibold ml-3 text-[16px]">Patient directory</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={signOut}
          className="bg-white rounded-[28px] p-5 mt-6 border border-red-100 flex-row items-center justify-center active:opacity-90 shadow-sm"
        >
          <LogOut size={20} color="#dc2626" />
          <Text className="text-red-600 font-bold text-[16px] ml-2">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DentistAccountScreen;

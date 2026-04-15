import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { dummyUser } from '../../data/mockData';
import { Mail, Phone, ChevronRight, LogOut, CalendarClock, Bell, Shield } from 'lucide-react-native';

const PatientProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const signOut = () => {
    const stack = navigation.getParent()?.getParent?.() ?? navigation.getParent();
    stack?.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
  };

  const Row = ({ icon: Icon, label, onPress, subtle, last }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between py-4 active:bg-slate-50/80 ${last ? '' : 'border-b border-slate-100'}`}
    >
      <View className="flex-row items-center flex-1 min-w-0">
        <View className="bg-brand-50 p-2.5 rounded-2xl border border-brand-100/50">
          <Icon size={20} color="#0d9488" />
        </View>
        <Text className={`ml-3 font-semibold text-[16px] ${subtle ? 'text-slate-400' : 'text-ink'}`}>
          {label}
        </Text>
      </View>
      {!subtle && <ChevronRight size={20} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="bg-slate-950 px-6 pb-20 rounded-b-[40px] border-b border-slate-800"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="absolute bottom-10 right-4 w-44 h-44 rounded-full bg-brand-500/10" />
        <Text className="text-brand-300/90 text-[11px] font-bold uppercase tracking-[2px]">Profile</Text>
        <Text className="text-white text-[28px] font-bold mt-2 tracking-tight">Your account</Text>
        <Text className="text-slate-400 text-[14px] mt-2 leading-5">Manage care preferences and history.</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 -mt-14"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-xl shadow-slate-900/8 items-center">
          <View className="w-[88px] h-[88px] rounded-full bg-brand-600 items-center justify-center border-4 border-white shadow-lg shadow-brand-900/25">
            <Text className="text-white text-[32px] font-bold">
              {dummyUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          <Text className="text-xl font-bold text-ink mt-4">{dummyUser.name}</Text>
          <View className="bg-slate-100 px-4 py-1.5 rounded-full mt-2 border border-slate-200/80">
            <Text className="text-slate-600 text-[12px] font-bold uppercase tracking-wider">Patient</Text>
          </View>
        </View>

        <View className="bg-white rounded-[28px] px-5 mt-5 border border-slate-200/80 shadow-sm">
          <View className="flex-row items-center py-4 border-b border-slate-100">
            <Mail size={18} color="#64748b" />
            <Text className="text-slate-700 ml-3 flex-1 text-[15px]">{dummyUser.email}</Text>
          </View>
          <View className="flex-row items-center py-4">
            <Phone size={18} color="#64748b" />
            <Text className="text-slate-700 ml-3 flex-1 text-[15px]">{dummyUser.phone}</Text>
          </View>
        </View>

        <Text className="text-slate-500 text-[12px] font-bold uppercase tracking-wider mt-8 mb-2 px-2">Care</Text>
        <View className="bg-white rounded-[28px] px-5 border border-slate-200/80 shadow-sm overflow-hidden">
          <Row
            icon={CalendarClock}
            label="Visit history"
            onPress={() => navigation.navigate('PatientVisitHistory')}
          />
          <Row icon={Bell} label="Notifications" onPress={() => navigation.navigate('PatientSettings')} />
          <Row
            icon={Shield}
            label="Privacy & data"
            last
            onPress={() => navigation.navigate('PatientSettings')}
          />
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

export default PatientProfileScreen;

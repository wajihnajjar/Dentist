import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dentistUser } from '../../data/mockData';
import { ChevronLeft, Clock, MapPin, Bell } from 'lucide-react-native';

const DentistSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [slotAlerts, setSlotAlerts] = useState(true);
  const [waitlist, setWaitlist] = useState(false);

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 flex-row items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm shadow-slate-900/6"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[26px] font-bold text-ink tracking-tight">Clinic settings</Text>
          <Text className="text-slate-500 text-[14px] mt-1">{dentistUser.practiceName}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4 mb-4">
          <View className="flex-row items-start">
            <MapPin size={20} color="#0d9488" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-500 text-xs font-semibold uppercase">Address</Text>
              <Text className="text-slate-900 font-medium mt-1 leading-6">{dentistUser.practiceAddress}</Text>
            </View>
          </View>
          <View className="flex-row items-start mt-5 pt-5 border-t border-slate-100">
            <Clock size={20} color="#0d9488" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-500 text-xs font-semibold uppercase">Hours (demo)</Text>
              <Text className="text-slate-900 font-medium mt-1 leading-6">
                Mon–Fri · 8:00 – 17:00{'\n'}Sat · 9:00 – 13:00
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm shadow-slate-900/4 overflow-hidden">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <View className="flex-row items-center flex-1 pr-3">
              <Bell size={20} color="#0d9488" />
              <Text className="text-slate-900 font-semibold ml-3">Same-day openings</Text>
            </View>
            <Switch value={slotAlerts} onValueChange={setSlotAlerts} trackColor={{ true: '#99f6e4' }} />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center flex-1 pr-3">
              <Bell size={20} color="#0d9488" />
              <Text className="text-slate-900 font-semibold ml-3">Waitlist for cancellations</Text>
            </View>
            <Switch value={waitlist} onValueChange={setWaitlist} trackColor={{ true: '#99f6e4' }} />
          </View>
        </View>

        <Text className="text-slate-400 text-xs mt-4 px-1 leading-5">
          Settings are illustrative only in this demo build.
        </Text>
      </ScrollView>
    </View>
  );
};

export default DentistSettingsScreen;

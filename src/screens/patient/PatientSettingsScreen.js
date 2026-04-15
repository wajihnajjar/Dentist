import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Mail, MessageSquare } from 'lucide-react-native';

const PatientSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [emailAppts, setEmailAppts] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);
  const [promos, setPromos] = useState(false);

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
          <Text className="text-[26px] font-bold text-ink tracking-tight">Notifications</Text>
          <Text className="text-slate-500 text-[14px] mt-1">How we reach you about care</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm shadow-slate-900/4 overflow-hidden">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <View className="flex-row items-center flex-1 pr-3">
              <Bell size={20} color="#0d9488" />
              <Text className="text-slate-900 font-semibold ml-3">Appointment reminders</Text>
            </View>
            <Switch value={smsReminders} onValueChange={setSmsReminders} trackColor={{ true: '#99f6e4' }} />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <View className="flex-row items-center flex-1 pr-3">
              <Mail size={20} color="#0d9488" />
              <Text className="text-slate-900 font-semibold ml-3">Email confirmations</Text>
            </View>
            <Switch value={emailAppts} onValueChange={setEmailAppts} trackColor={{ true: '#99f6e4' }} />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center flex-1 pr-3">
              <MessageSquare size={20} color="#0d9488" />
              <Text className="text-slate-900 font-semibold ml-3">Tips & oral health updates</Text>
            </View>
            <Switch value={promos} onValueChange={setPromos} trackColor={{ true: '#99f6e4' }} />
          </View>
        </View>

        <Text className="text-slate-400 text-xs mt-4 px-1 leading-5">
          Preferences are local to this demo and are not saved to a server.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PatientSettingsScreen;

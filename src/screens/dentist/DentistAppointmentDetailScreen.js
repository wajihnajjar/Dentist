import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dentists } from '../../data/mockData';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  ClipboardList,
  MapPin,
  Check,
  X,
} from 'lucide-react-native';

const DentistAppointmentDetailScreen = ({ route, navigation }) => {
  const { appointment: initial } = route.params;
  const [appointment, setAppointment] = useState(initial);
  const insets = useSafeAreaInsets();

  const confirm = () => {
    Alert.alert('Confirm visit', `Mark ${appointment.patientName} as confirmed?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => setAppointment((a) => ({ ...a, status: 'Confirmed' })),
      },
    ]);
  };

  const cancelSlot = () => {
    Alert.alert('Cancel slot', 'Release this time in the demo?', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Release', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm shadow-slate-900/6"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <Text className="text-[22px] font-bold text-ink flex-1 tracking-tight">Appointment</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center mb-4">
            <User size={18} color="#64748b" />
            <Text className="text-slate-900 text-lg font-bold ml-3 flex-1">{appointment.patientName}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Calendar size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.date}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.time}</Text>
          </View>
          <View className="flex-row items-start mb-3">
            <Stethoscope size={18} color="#64748b" style={{ marginTop: 2 }} />
            <Text className="text-slate-800 font-semibold ml-3 flex-1">{appointment.treatmentType}</Text>
          </View>
          {appointment.room ? (
            <View className="flex-row items-center mb-3">
              <MapPin size={18} color="#64748b" />
              <Text className="text-slate-800 font-semibold ml-3">{appointment.room}</Text>
            </View>
          ) : null}
          <View
            className={`self-start px-3 py-1.5 rounded-full ${
              appointment.status === 'Confirmed' ? 'bg-emerald-50' : 'bg-amber-50'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                appointment.status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {appointment.status}
            </Text>
          </View>
        </View>

        {appointment.notes ? (
          <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm mt-4">
            <View className="flex-row items-center mb-2">
              <ClipboardList size={18} color="#0d9488" />
              <Text className="text-slate-900 font-bold ml-2">Clinical notes</Text>
            </View>
            <Text className="text-slate-600 leading-6">{appointment.notes}</Text>
          </View>
        ) : null}

        <Text className="text-slate-500 text-xs mt-4 mb-2 px-1">
          Provider: {dentists.find((d) => d.id === appointment.dentistId)?.name ?? appointment.dentistId}
        </Text>

        <View className={`flex-row mt-4 ${appointment.status === 'Confirmed' ? '' : 'gap-3'}`}>
          {appointment.status !== 'Confirmed' ? (
            <TouchableOpacity
              onPress={confirm}
              className="flex-1 bg-brand-600 rounded-2xl py-4 flex-row items-center justify-center active:opacity-92"
            >
              <Check size={20} color="white" />
              <Text className="text-white font-bold ml-2">Confirm</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={cancelSlot}
            className={`rounded-2xl py-4 flex-row items-center justify-center border border-red-200 bg-red-50 active:opacity-90 ${
              appointment.status === 'Confirmed' ? 'flex-1' : 'flex-1'
            }`}
          >
            <X size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold ml-2">Release slot</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DentistAppointmentDetailScreen;

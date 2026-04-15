import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dentists, dentistUser } from '../../data/mockData';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  ClipboardList,
} from 'lucide-react-native';

const PatientAppointmentDetailScreen = ({ route, navigation }) => {
  const { appointment } = route.params;
  const insets = useSafeAreaInsets();
  const dentist = dentists.find((d) => d.id === appointment.dentistId);

  const callClinic = () => {
    const url = `tel:${dentistUser.phone.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() => Alert.alert('Unable to open phone', 'Try again on a device.'));
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
        <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4">
          <Text className="text-slate-500 text-sm font-medium">Provider</Text>
          <Text className="text-slate-900 text-xl font-bold mt-1">{dentist?.name ?? 'Clinic'}</Text>
          <Text className="text-brand-700 font-medium mt-1">{dentist?.specialty}</Text>

          <View className="h-px bg-slate-100 my-5" />

          <View className="flex-row items-center mb-4">
            <Calendar size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.date}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Clock size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.time}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Stethoscope size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3 flex-1">{appointment.treatmentType}</Text>
          </View>
          {appointment.room ? (
            <View className="flex-row items-center mb-4">
              <MapPin size={18} color="#64748b" />
              <Text className="text-slate-800 font-semibold ml-3">
                {appointment.room} · {dentistUser.practiceName}
              </Text>
            </View>
          ) : null}

          <View
            className={`self-start px-3 py-1.5 rounded-full mt-2 ${
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
          <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4 mt-4">
            <View className="flex-row items-center mb-2">
              <ClipboardList size={18} color="#0d9488" />
              <Text className="text-slate-900 font-bold ml-2">Notes from the clinic</Text>
            </View>
            <Text className="text-slate-600 leading-6">{appointment.notes}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={callClinic}
          className="bg-slate-950 rounded-2xl py-4 flex-row items-center justify-center mt-6 border border-slate-800 active:opacity-92 shadow-lg shadow-slate-900/20"
        >
          <Phone size={20} color="white" />
          <Text className="text-white font-bold text-[16px] ml-2">Call {dentistUser.practiceName}</Text>
        </TouchableOpacity>

        <Text className="text-slate-400 text-xs text-center mt-4 leading-5">
          Reschedule or cancel from the Bookings tab in a production build — demo is view-only.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PatientAppointmentDetailScreen;

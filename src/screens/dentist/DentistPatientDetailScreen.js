import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockAppointments, dentistUser } from '../../data/mockData';
import { ChevronLeft, Mail, Phone, Calendar, Stethoscope } from 'lucide-react-native';

const DentistPatientDetailScreen = ({ route, navigation }) => {
  const { patient } = route.params;
  const insets = useSafeAreaInsets();

  const history = useMemo(
    () =>
      mockAppointments
        .filter((a) => a.patientId === patient.id || a.patientName === patient.name)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [patient.id, patient.name]
  );

  const dial = () => {
    Linking.openURL(`tel:${patient.phone.replace(/\D/g, '')}`).catch(() =>
      Alert.alert('Unable to open phone', 'Try on a device.')
    );
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
        <Text className="text-[22px] font-bold text-ink flex-1 tracking-tight" numberOfLines={1}>
          {patient.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center py-2">
            <Mail size={18} color="#64748b" />
            <Text className="text-slate-700 ml-3 flex-1">{patient.email}</Text>
          </View>
          <TouchableOpacity onPress={dial} className="flex-row items-center py-3 mt-2 active:opacity-80">
            <Phone size={18} color="#0d9488" />
            <Text className="text-brand-700 font-semibold ml-3">{patient.phone}</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-xs mt-4">
            Chart at {dentistUser.practiceName} · demo data only
          </Text>
        </View>

        <Text className="text-slate-800 font-bold text-lg mt-8 mb-3">Recent appointments</Text>
        {history.length === 0 ? (
          <Text className="text-slate-500">No visits recorded.</Text>
        ) : (
          history.map((app) => (
            <TouchableOpacity
              key={app.id}
              onPress={() => navigation.navigate('DentistAppointmentDetail', { appointment: app })}
              className="bg-white rounded-[20px] p-4 mb-3 border border-slate-100 flex-row items-center"
            >
              <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
                <Calendar size={18} color="#64748b" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-slate-900 font-semibold">
                  {app.date} · {app.time}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Stethoscope size={14} color="#94a3b8" />
                  <Text className="text-slate-500 text-sm ml-1" numberOfLines={1}>
                    {app.treatmentType}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistPatientDetailScreen;

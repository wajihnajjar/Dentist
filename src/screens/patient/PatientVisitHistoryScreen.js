import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { ChevronLeft, Stethoscope } from 'lucide-react-native';

const PatientVisitHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAppointments('PATIENT', null);
        // Sort newest first
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => 
          (a.appointment_date < b.appointment_date ? 1 : a.appointment_date > b.appointment_date ? -1 : 0)
        );
        setVisits(sorted);
      } catch (error) {
        console.error('Failed to load visit history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, []);

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm shadow-slate-900/6"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[26px] font-bold text-ink tracking-tight">Visit history</Text>
          <Text className="text-slate-500 text-[14px] mt-1">Past and upcoming visits</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
        ) : visits.length === 0 ? (
          <View className="bg-white rounded-[28px] p-10 border border-dashed border-slate-200 items-center mt-4">
            <Text className="text-slate-500 text-center text-[15px]">No visits on file yet.</Text>
          </View>
        ) : (
          visits.map((app) => {
            const hasRecord = !!(app.diagnosis || app.prescription || app.clinical_notes || app.notes);
            const displayStatus = hasRecord ? 'DONE' : (app.status || 'PENDING');

            return (
            <TouchableOpacity
              key={app.id}
              onPress={() => navigation.navigate('PatientAppointmentDetail', { appointment: app })}
              className="bg-white rounded-[26px] p-4 mb-3 border border-slate-200/70 shadow-sm shadow-slate-900/4 flex-row items-center active:opacity-95"
            >
              <View className="bg-brand-50 p-3 rounded-2xl mr-3 border border-brand-100/50">
                <Stethoscope size={22} color="#0d9488" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-slate-900 font-bold text-[16px]">{app.treatment_type || 'Consultation'}</Text>
                <Text className="text-slate-500 text-sm mt-1">
                  {app.appointment_date ? app.appointment_date.split('T')[0] : ''} · {app.start_time?.substring(0, 5)}
                </Text>
                <Text className="text-brand-700 text-sm font-medium mt-1" numberOfLines={1}>
                  {app.practice_name || app.dentist_name || 'Clinic'}
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  displayStatus === 'DONE' ? 'bg-indigo-50' :
                  displayStatus === 'CONFIRMED' || displayStatus === 'SCHEDULED' ? 'bg-emerald-50' : 
                  displayStatus === 'CANCELLED' ? 'bg-red-50' : 'bg-amber-50'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    displayStatus === 'DONE' ? 'text-indigo-700' :
                    displayStatus === 'CONFIRMED' || displayStatus === 'SCHEDULED' ? 'text-emerald-700' : 
                    displayStatus === 'CANCELLED' ? 'text-red-700' : 'text-amber-800'
                  }`}
                >
                  {displayStatus}
                </Text>
              </View>
            </TouchableOpacity>
          )})
        )}
      </ScrollView>
    </View>
  );
};

export default PatientVisitHistoryScreen;

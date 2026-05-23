import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { ChevronLeft, User, Phone, ChevronRight } from 'lucide-react-native';

const DentistPatientsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = async () => {
    try {
      // We derive the patient list from all appointments
      const appointments = await api.getAppointments('DENTIST');
      
      const uniquePatientsMap = {};
      
      if (Array.isArray(appointments)) {
        appointments.forEach((app) => {
          if (!app.patient_id) return;
          
          if (!uniquePatientsMap[app.patient_id]) {
            uniquePatientsMap[app.patient_id] = {
              id: app.patient_id,
              name: app.patient_name || 'Unknown',
              phone: app.phone || 'No phone',
              email: app.email || 'No email',
              lastVisit: app.appointment_date,
              appointments: [app]
            };
          } else {
            // Add appointment to history and update lastVisit if more recent
            uniquePatientsMap[app.patient_id].appointments.push(app);
            if (app.appointment_date > uniquePatientsMap[app.patient_id].lastVisit) {
              uniquePatientsMap[app.patient_id].lastVisit = app.appointment_date;
            }
          }
        });
      }

      const patientList = Object.values(uniquePatientsMap).sort((a, b) => (a.name > b.name ? 1 : -1));
      setPatients(patientList);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

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
          <Text className="text-[26px] font-bold text-ink tracking-tight">Patients</Text>
          <Text className="text-slate-500 text-[14px] mt-1">{patients.length} in your practice</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
      >
        {patients.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => navigation.navigate('DentistPatientDetail', { patient: p })}
            className="bg-white rounded-[26px] p-4 mb-3 border border-slate-200/70 flex-row items-center shadow-sm shadow-slate-900/4 active:opacity-95"
          >
            <View className="bg-brand-50 w-12 h-12 rounded-2xl items-center justify-center mr-3 border border-brand-100/50">
              <User size={22} color="#0d9488" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-slate-900 font-bold text-[16px]">{p.name}</Text>
              <View className="flex-row items-center mt-1">
                <Phone size={14} color="#94a3b8" />
                <Text className="text-slate-500 text-sm ml-1.5">{p.phone}</Text>
              </View>
              <Text className="text-slate-400 text-xs mt-1">Last visit · {p.lastVisit}</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default DentistPatientsScreen;

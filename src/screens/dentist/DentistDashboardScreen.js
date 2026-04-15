import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockAppointments, dentistUser } from '../../data/mockData';
import {
  Calendar,
  Users,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';

const todayIso = new Date().toISOString().split('T')[0];

const StatCard = ({ icon: Icon, iconBg, iconColor, value, label }) => (
  <View className="w-[48%] bg-white rounded-[26px] p-4 border border-slate-200/70 shadow-sm shadow-slate-900/4 mb-4 overflow-hidden">
    <View className="absolute top-0 left-0 right-0 h-1 bg-brand-500/80" />
    <View className={`${iconBg} w-11 h-11 rounded-2xl items-center justify-center mb-3 mt-1`}>
      <Icon size={20} color={iconColor} />
    </View>
    <Text className="text-[32px] font-bold text-ink tracking-tight">{value}</Text>
    <Text className="text-slate-500 text-[13px] font-semibold mt-1 leading-4">{label}</Text>
  </View>
);

const DentistDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => {
    const mine = mockAppointments.filter((a) => a.dentistId === dentistUser.id);
    const today = mine.filter((a) => a.date === todayIso);
    const pending = mine.filter((a) => a.status === 'Pending').length;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const recent = mine.filter((a) => new Date(a.date + 'T12:00:00') >= weekStart).length;
    return {
      todayCount: today.length,
      pending,
      weekCount: recent,
      todaySlots: today.sort((a, b) => a.time.localeCompare(b.time)),
    };
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="bg-slate-950 px-6 pb-10 rounded-b-[40px] border-b border-slate-800"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="absolute bottom-6 right-5 w-40 h-40 rounded-full bg-brand-500/10" />
        <Text className="text-brand-300/90 text-[11px] font-bold uppercase tracking-[2px]">Dashboard</Text>
        <Text className="text-white text-[26px] font-bold mt-2 tracking-tight leading-tight" numberOfLines={2}>
          {dentistUser.practiceName}
        </Text>
        <Text className="text-slate-400 text-[14px] mt-3 leading-5">
          Today&apos;s chair time and quick actions.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 -mt-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          <StatCard
            icon={Calendar}
            iconBg="bg-brand-50"
            iconColor="#0d9488"
            value={stats.todayCount}
            label="Visits today"
          />
          <StatCard
            icon={ClipboardCheck}
            iconBg="bg-amber-50"
            iconColor="#d97706"
            value={stats.pending}
            label="Pending confirm"
          />
          <StatCard
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="#059669"
            value={stats.weekCount}
            label="Last 7 days"
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('DentistPatients')}
            className="w-[48%] bg-slate-950 rounded-[26px] p-4 mb-4 border border-slate-800 shadow-lg shadow-slate-900/20 justify-between active:opacity-95"
          >
            <View className="bg-white/10 w-11 h-11 rounded-2xl items-center justify-center mb-3 border border-white/10">
              <Users size={20} color="#99f6e4" />
            </View>
            <Text className="text-white font-bold text-[16px]">Patients</Text>
            <Text className="text-slate-500 text-[11px] font-semibold mt-1 uppercase tracking-wide">
              Directory
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-8 mb-3 px-1">
          <Text className="text-[20px] font-bold text-ink tracking-tight">Today&apos;s schedule</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Schedule')} className="flex-row items-center">
            <Text className="text-brand-700 font-bold text-[13px] mr-0.5">Calendar</Text>
            <ChevronRight size={18} color="#0d9488" />
          </TouchableOpacity>
        </View>

        {stats.todaySlots.length === 0 ? (
          <View className="bg-white rounded-[26px] p-9 border border-dashed border-slate-200 items-center">
            <Text className="text-slate-500 text-center text-[15px] leading-6">
              No appointments on the calendar for today.
            </Text>
          </View>
        ) : (
          stats.todaySlots.map((app) => (
            <TouchableOpacity
              key={app.id}
              onPress={() => navigation.navigate('DentistAppointmentDetail', { appointment: app })}
              className="bg-white rounded-[24px] p-4 mb-3 border border-slate-200/70 flex-row items-center shadow-sm shadow-slate-900/4 active:opacity-92"
            >
              <View className="bg-slate-950 px-3.5 py-2.5 rounded-2xl mr-3">
                <Text className="text-white font-bold text-[14px]">{app.time}</Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-ink font-bold text-[16px]" numberOfLines={1}>
                  {app.patientName}
                </Text>
                <Text className="text-slate-500 text-[13px] mt-0.5" numberOfLines={1}>
                  {app.treatmentType}
                </Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistDashboardScreen;

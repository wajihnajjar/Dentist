import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { mockAppointments, dummyUser, dentists } from '../../data/mockData';
import { Clock, Calendar as CalendarIcon, User, Settings, CalendarHeart, ChevronRight } from 'lucide-react-native';

const formatLong = (iso) => {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const CalendarScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [blockedDates, setBlockedDates] = useState({
    '2026-04-20': { blocked: true, color: '#fee2e2' },
    '2026-04-25': { blocked: true, color: '#fee2e2' },
  });

  const isPatientBookings = route.name === 'Bookings';

  const appointmentsForDate = useMemo(() => {
    return mockAppointments.filter((app) => {
      if (app.date !== selectedDate) return false;
      if (isPatientBookings) {
        return app.patientName === dummyUser.name;
      }
      return app.dentistId === 'd1';
    });
  }, [selectedDate, isPatientBookings]);

  const toggleVacation = () => {
    if (isPatientBookings) return;
    const isCurrentlyBlocked = blockedDates[selectedDate];
    const next = { ...blockedDates };
    if (isCurrentlyBlocked) {
      delete next[selectedDate];
    } else {
      next[selectedDate] = { blocked: true, color: '#fee2e2' };
    }
    setBlockedDates(next);
  };

  const markedDates = {
    ...Object.keys(blockedDates).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: '#f87171',
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#0d9488' : undefined,
      };
      return acc;
    }, {}),
    [selectedDate]: {
      selected: true,
      selectedColor: '#0d9488',
      ...(blockedDates[selectedDate] ? { marked: true, dotColor: '#f87171' } : {}),
    },
  };

  const title = isPatientBookings ? 'Your visits' : 'Clinic schedule';
  const subtitle = isPatientBookings
    ? 'See what is coming up and plan around it.'
    : 'Manage chair time and days away from the office.';

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="bg-slate-950 px-6 pb-12 rounded-b-[40px] border-b border-slate-800"
        style={{ paddingTop: insets.top + 14 }}
      >
        <View className="absolute bottom-8 right-6 w-40 h-40 rounded-full bg-brand-500/10" />
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-3">
            <Text className="text-brand-300/90 text-[12px] font-bold uppercase tracking-[2px]">
              {isPatientBookings ? 'Patient' : 'Clinic'}
            </Text>
            <Text className="text-white/90 text-[13px] font-medium mt-2">
              {isPatientBookings ? 'Hello,' : 'Welcome back,'}
            </Text>
            <Text className="text-white text-[30px] font-bold mt-1 tracking-tight leading-tight">
              {isPatientBookings ? dummyUser.name : 'Dr. Sarah Smith'}
            </Text>
            <Text className="text-slate-400 text-[15px] mt-3 leading-6">{subtitle}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(isPatientBookings ? 'PatientSettings' : 'DentistSettings')
            }
            className="bg-white/10 p-3.5 rounded-2xl border border-white/10 active:opacity-80"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={22} color="#e2e8f0" />
          </TouchableOpacity>
        </View>

        <View className="bg-white/5 p-4 rounded-[22px] flex-row items-center border border-white/10">
          <View className="bg-brand-500/20 p-3 rounded-2xl mr-3 border border-brand-400/20">
            {isPatientBookings ? (
              <CalendarHeart size={20} color="#5eead4" />
            ) : (
              <CalendarIcon size={20} color="#5eead4" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</Text>
            <Text className="text-white font-semibold text-[16px] mt-1 leading-5">{formatLong(selectedDate)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 -mt-7"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[32px] p-2 pt-4 mb-6 border border-slate-200/80 shadow-sm shadow-slate-900/5">
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              todayTextColor: '#0d9488',
              selectedDayBackgroundColor: '#0d9488',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#0d9488',
              textMonthFontWeight: '700',
              monthTextColor: '#0c1222',
              textDayFontSize: 15,
              textDayHeaderFontSize: 11,
              textSectionTitleColor: '#94a3b8',
              dayTextColor: '#334155',
              textDisabledColor: '#cbd5e1',
            }}
          />

          {!isPatientBookings ? (
            <TouchableOpacity
              onPress={toggleVacation}
              className={`mx-2 mb-3 mt-2 py-4 rounded-2xl flex-row justify-center items-center border ${
                blockedDates[selectedDate]
                  ? 'bg-red-50 border-red-100'
                  : 'bg-brand-50 border-brand-100/80'
              }`}
            >
              <Text
                className={`font-bold text-[15px] ${
                  blockedDates[selectedDate] ? 'text-red-700' : 'text-brand-800'
                }`}
              >
                {blockedDates[selectedDate] ? 'Mark as available' : 'Mark day as closed'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mx-2 mb-3 mt-2 py-3.5 px-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Text className="text-slate-500 text-[13px] text-center leading-5">
                Vacation controls appear in the dentist preview only.
              </Text>
            </View>
          )}
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-[22px] font-bold text-ink tracking-tight">Appointments</Text>
            <View className="bg-slate-900 px-3.5 py-1.5 rounded-full">
              <Text className="text-white font-bold text-[12px]">{appointmentsForDate.length}</Text>
            </View>
          </View>

          {appointmentsForDate.length > 0 ? (
            appointmentsForDate.map((app) => (
              <TouchableOpacity
                key={app.id}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate(
                    isPatientBookings ? 'PatientAppointmentDetail' : 'DentistAppointmentDetail',
                    { appointment: app }
                  )
                }
                className="bg-white rounded-[24px] p-4 mb-3 border border-slate-200/70 flex-row items-center shadow-sm shadow-slate-900/4"
              >
                <View className="bg-brand-50 p-3.5 rounded-2xl mr-3 border border-brand-100/60">
                  <Clock size={22} color="#0d9488" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-lg font-bold text-ink">{app.time}</Text>
                  <View className="flex-row items-center mt-1">
                    <User size={14} color="#94a3b8" />
                    <Text className="text-slate-600 ml-1.5 font-medium text-[14px]" numberOfLines={2}>
                      {isPatientBookings
                        ? `With ${dentists.find((d) => d.id === app.dentistId)?.name ?? 'your clinic'}`
                        : app.patientName}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-3 py-1.5 rounded-full ${
                    app.status === 'Confirmed' ? 'bg-emerald-50' : 'bg-amber-50'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      app.status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {app.status}
                  </Text>
                </View>
                <ChevronRight size={18} color="#cbd5e1" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-[24px] p-10 items-center border border-dashed border-slate-200">
              <Text className="text-slate-600 font-medium text-[16px] text-center">Nothing on this day</Text>
              {blockedDates[selectedDate] && !isPatientBookings ? (
                <Text className="text-red-500 text-sm mt-2 text-center font-medium">Marked as closed</Text>
              ) : null}
              {isPatientBookings ? (
                <Text className="text-slate-400 text-sm mt-2 text-center leading-6">
                  Explore the map tab to book your next visit.
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;

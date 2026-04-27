import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { api } from '../../api/client';
import { blockedDates as dummyBlockedDates } from '../../data/mockData';
import { CheckCircle, CreditCard, ChevronLeft, CalendarDays, Clock } from 'lucide-react-native';

const StepDot = ({ n, active, done }) => (
  <View className="flex-row items-center">
    <View
      className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
        done ? 'bg-brand-500 border-brand-400' : active ? 'border-brand-400 bg-brand-500/20' : 'border-white/25'
      }`}
    >
      <Text
        className={`text-[13px] font-bold ${done || active ? 'text-white' : 'text-white/40'}`}
      >
        {n}
      </Text>
    </View>
  </View>
);

const BookingScreen = ({ route, navigation }) => {
  const { dentist } = route.params;
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const slots = await api.getSlots(dentist.user_id || dentist.id, selectedDate);
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Failed to fetch slots:', error);
        }
      };
      fetchSlots();
    }
  }, [selectedDate]);

  const markedDates = {
    ...Object.keys(dummyBlockedDates).reduce((acc, date) => {
      acc[date] = {
        disabled: true,
        disableTouchEvent: true,
        startingDay: true,
        endingDay: true,
        color: '#fee2e2',
        textColor: '#b91c1c',
      };
      return acc;
    }, {}),
    ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#0d9488' } } : {}),
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Almost there', 'Choose a date and a time slot to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Simulate Payment Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Actually Save Appointment to Database
      await api.createAppointment({
        dentist_id: dentist.user_id || dentist.id,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        treatment_type: 'General Consultation'
      });

      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        navigation.navigate('PatientTabs', { screen: 'Explore' });
      }, 2200);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Booking Error', 'We could not save your appointment. Please try again.');
    }
  };

  const goExplore = () => {
    navigation.navigate('PatientTabs', { screen: 'Explore' });
  };

  const step1 = !!selectedDate;
  const step2 = !!selectedSlot;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerStyle={{ paddingBottom: selectedDate && selectedSlot ? insets.bottom + 140 : insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-slate-950 px-6 pb-14 rounded-b-[40px] border-b border-slate-800"
          style={{ paddingTop: insets.top + 10 }}
        >
          <View className="absolute bottom-6 right-4 w-36 h-36 rounded-full bg-brand-500/10" />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/10 w-12 h-12 rounded-2xl items-center justify-center mb-6 border border-white/10"
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between mb-8 pr-2">
            <StepDot n={1} active={!step1} done={step1} />
            <View className="flex-1 h-px bg-white/15 mx-2" />
            <StepDot n={2} active={step1 && !step2} done={step2} />
            <View className="flex-1 h-px bg-white/15 mx-2" />
            <StepDot n={3} active={step2} done={false} />
          </View>
          <Text className="text-brand-300/90 text-[11px] font-bold uppercase tracking-[2px]">Booking</Text>
          <Text className="text-white text-[30px] font-bold tracking-tight mt-1">Book a visit</Text>
          <Text className="text-white text-[18px] font-semibold mt-3">{dentist.name}</Text>
          <Text className="text-slate-400 text-sm mt-1">{dentist.specialty}</Text>

          <View className="flex-row mt-7 bg-white/5 rounded-[22px] p-4 border border-white/10">
            <View className="flex-1 flex-row items-center min-w-0">
              <CalendarDays size={18} color="#94a3b8" />
              <Text className="text-slate-300 text-[13px] font-semibold ml-2 flex-1" numberOfLines={1}>
                {selectedDate ? selectedDate : 'Pick a day'}
              </Text>
            </View>
            <View className="w-px bg-white/10 mx-3" />
            <View className="flex-1 flex-row items-center min-w-0">
              <Clock size={18} color="#94a3b8" />
              <Text className="text-slate-300 text-[13px] font-semibold ml-2 flex-1" numberOfLines={1}>
                {selectedSlot ?? 'Pick time'}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 -mt-9">
          <View className="bg-white rounded-[32px] p-2 pt-4 border border-slate-200/80 shadow-lg shadow-slate-900/6">
            <Text className="text-ink font-bold text-[16px] mb-2 px-3">Select date</Text>
            <Calendar
              onDayPress={(day) => {
                if (!dummyBlockedDates[day.dateString]) {
                  setSelectedDate(day.dateString);
                  setSelectedSlot(null);
                }
              }}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                todayTextColor: '#0d9488',
                selectedDayBackgroundColor: '#0d9488',
                selectedDayTextColor: '#ffffff',
                arrowColor: '#0d9488',
                textMonthFontWeight: '700',
                textDayFontSize: 15,
                textDayHeaderFontSize: 11,
                monthTextColor: '#0c1222',
                textSectionTitleColor: '#94a3b8',
                dayTextColor: '#334155',
                textDisabledColor: '#cbd5e1',
              }}
            />
            <Text className="text-slate-400 text-[12px] mt-2 mb-2 px-3 leading-5">
              Shaded days are unavailable for this provider.
            </Text>
          </View>
        </View>

        {selectedDate ? (
          <View className="px-5 mt-8">
            <Text className="text-[22px] font-bold text-ink tracking-tight">Available times</Text>
            <Text className="text-slate-500 text-sm mt-2 mb-5 leading-5">
              Tap a slot. You can change it before confirming.
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {availableSlots.map((slot) => {
                const active = selectedSlot === slot;
                return (
                  <View key={slot} className="w-[48%] mb-3">
                    <TouchableOpacity
                      onPress={() => setSelectedSlot(slot)}
                      className={`py-4 items-center rounded-2xl border ${
                        active
                          ? 'bg-brand-600 border-brand-500 shadow-md shadow-brand-900/20'
                          : 'bg-white border-slate-200/90 shadow-sm'
                      }`}
                      activeOpacity={0.88}
                    >
                      <Text className={`font-bold text-[17px] ${active ? 'text-white' : 'text-ink'}`}>{slot}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {selectedDate && selectedSlot ? (
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200/80 px-5 pt-4 shadow-2xl shadow-slate-900/20"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
        >
          <TouchableOpacity
            onPress={handleBooking}
            className="flex-row items-center justify-center py-4 rounded-2xl border bg-slate-950 border-slate-800 shadow-lg shadow-slate-900/25"
            activeOpacity={0.92}
          >
            <CreditCard size={22} color="white" />
            <Text className="font-bold text-[17px] ml-2 text-white">
              Pay & confirm
            </Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-[11px] text-center mt-3 leading-5 px-2">
            Demo only — no charge. You will return to the map when finished.
          </Text>
        </View>
      ) : null}

      <Modal visible={isProcessing} transparent animationType="fade">
        <View className="flex-1 bg-slate-950/60 items-center justify-center px-8">
          <View className="bg-white p-8 rounded-[32px] items-center w-full max-w-sm border border-slate-100 shadow-2xl">
            <ActivityIndicator size="large" color="#0d9488" />
            <Text className="text-xl font-bold text-ink mt-6 text-center">Processing…</Text>
            <Text className="text-slate-500 mt-2 text-center text-[15px] leading-6">
              Confirming your demo payment.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal visible={isSuccess} transparent animationType="fade">
        <View className="flex-1 bg-slate-950/60 items-center justify-center px-8">
          <View className="bg-white p-8 rounded-[32px] items-center w-full max-w-sm border border-slate-100 shadow-2xl">
            <View className="bg-emerald-50 p-5 rounded-full border border-emerald-100">
              <CheckCircle size={52} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-ink mt-6 text-center tracking-tight">You&apos;re booked</Text>
            <Text className="text-slate-500 mt-2 text-center text-[15px] leading-6">
              {dentist.name} · {selectedSlot}
            </Text>
            <TouchableOpacity
              onPress={goExplore}
              className="mt-7 px-8 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 active:opacity-92"
            >
              <Text className="text-white font-bold">Back to map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default BookingScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import AppAlertModal from '../../components/AppAlertModal';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  ClipboardList,
  XCircle,
  Pill,
  FileText
} from 'lucide-react-native';

const PatientAppointmentDetailScreen = ({ route, navigation }) => {
  const { appointment: initialAppointment } = route.params;
  const [appointment, setAppointment] = useState(initialAppointment);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [selectedRating, setSelectedRating] = useState(Number(initialAppointment.rating) || 0);
  const [ratingComment, setRatingComment] = useState(initialAppointment.rating_comment || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
  });
  const insets = useSafeAreaInsets();

  const showAlert = ({
    title,
    message,
    tone = 'info',
    confirmText = 'OK',
    cancelText = null,
    onConfirm = null,
  }) => {
    setAlertState({
      visible: true,
      title,
      message,
      tone,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const data = await api.getAppointment(appointment.id);
        if (!data.error) {
          setAppointment(prev => ({ ...prev, ...data }));
          if (data.rating) {
            setSelectedRating(Number(data.rating) || 0);
          }
          if (typeof data.rating_comment === 'string') {
            setRatingComment(data.rating_comment);
          }
        }
      } catch (err) {
        console.log('Failed to fetch full appointment details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchFullDetails();
  }, [appointment.id]);

  const callClinic = () => {
    // Check multiple possible locations for the phone number
    const phoneNumber = appointment.phone || appointment.dentist_phone || appointment.practice_phone;
    
    if (!phoneNumber) {
      showAlert({ title: 'No Phone Number', message: 'The clinic did not provide a phone number.' });
      return;
    }
    const url = `tel:${phoneNumber.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() =>
      showAlert({ title: 'Unable to Open Phone', message: 'Try again on a device.', tone: 'danger' })
    );
  };

  const handleCancel = () => {
    showAlert({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      tone: 'danger',
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep It',
      onConfirm: async () => {
        setIsCancelling(true);
        try {
          const res = await api.cancelAppointment(appointment.id);
          if (res.error) {
            showAlert({ title: 'Error', message: res.error, tone: 'danger' });
          } else {
            setAppointment(prev => ({ ...prev, status: 'CANCELLED' }));
            showAlert({ title: 'Success', message: 'Your appointment has been cancelled.', tone: 'success' });
          }
        } catch (error) {
          showAlert({ title: 'Error', message: 'Failed to connect to the server.', tone: 'danger' });
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) {
      showAlert({ title: 'Rating Required', message: 'Please select a rating from 1 to 5.' });
      return;
    }

    setIsSubmittingRating(true);
    try {
      const payload = {
        rating: selectedRating,
        rating_comment: ratingComment.trim() || undefined
      };
      const res = await api.rateAppointment(appointment.id, payload);
      if (res.error) {
        showAlert({ title: 'Error', message: res.error, tone: 'danger' });
      } else {
        setAppointment(prev => ({
          ...prev,
          rating: selectedRating,
          rating_comment: ratingComment.trim()
        }));
        showAlert({ title: 'Thank You!', message: 'Your rating has been submitted.', tone: 'success' });
      }
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to submit your rating. Please try again.', tone: 'danger' });
    } finally {
      setIsSubmittingRating(false);
    }
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
          <Text className="text-slate-900 text-xl font-bold mt-1">
            {appointment.dentist_name || appointment.practice_name || 'Dental Clinic'}
          </Text>
          <Text className="text-brand-700 font-medium mt-1">
            {appointment.practice_name || 'General Dentistry'}
          </Text>

          <View className="h-px bg-slate-100 my-5" />

          <View className="flex-row items-center mb-4">
            <Calendar size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">
              {appointment.appointment_date}
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Clock size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">
              {appointment.start_time?.substring(0, 5)}
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Stethoscope size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3 flex-1">
              {appointment.treatment_type || 'General Consultation'}
            </Text>
          </View>
          {appointment.room ? (
            <View className="flex-row items-center mb-4">
              <MapPin size={18} color="#64748b" />
              <Text className="text-slate-800 font-semibold ml-3">
                {appointment.room} · {appointment.practice_name || 'Clinic'}
              </Text>
            </View>
          ) : null}

          <View
            className={`self-start px-3 py-1.5 rounded-full mt-2 ${
              (appointment.diagnosis || appointment.prescription || appointment.clinical_notes || appointment.notes) ? 'bg-indigo-50' :
              appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' 
                ? 'bg-emerald-50' 
                : appointment.status === 'CANCELLED' 
                ? 'bg-red-50'
                : 'bg-amber-50'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                (appointment.diagnosis || appointment.prescription || appointment.clinical_notes || appointment.notes) ? 'text-indigo-700' :
                appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' 
                  ? 'text-emerald-700' 
                  : appointment.status === 'CANCELLED'
                  ? 'text-red-700'
                  : 'text-amber-800'
              }`}
            >
              {(appointment.diagnosis || appointment.prescription || appointment.clinical_notes || appointment.notes) ? 'DONE' : (appointment.status || 'PENDING')}
            </Text>
          </View>
        </View>

        {(appointment.diagnosis || appointment.prescription || appointment.clinical_notes || appointment.notes) ? (
          <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4 mt-4">
            <Text className="text-slate-800 font-bold text-lg mb-4">Clinical Record</Text>
            
            {appointment.diagnosis ? (
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Stethoscope size={18} color="#0d9488" />
                  <Text className="text-slate-700 font-bold ml-2 text-[15px]">Diagnosis</Text>
                </View>
                <Text className="text-slate-600 leading-6 pl-7">{appointment.diagnosis}</Text>
              </View>
            ) : null}

            {appointment.prescription ? (
              <View className="mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Pill size={18} color="#0d9488" />
                  <Text className="text-slate-700 font-bold ml-2 text-[15px]">Prescription</Text>
                </View>
                <Text className="text-slate-600 leading-6 pl-7">{appointment.prescription}</Text>
              </View>
            ) : null}

            {appointment.clinical_notes || appointment.notes ? (
              <View className={appointment.diagnosis || appointment.prescription ? '' : 'mb-2'}>
                <View className="flex-row items-center mb-1.5">
                  <FileText size={18} color="#0d9488" />
                  <Text className="text-slate-700 font-bold ml-2 text-[15px]">Clinical Notes</Text>
                </View>
                <Text className="text-slate-600 leading-6 pl-7">{appointment.clinical_notes || appointment.notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {appointment.prescription ? (
          <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4 mt-4">
            <Text className="text-slate-800 font-bold text-lg">Rate Your Visit</Text>
            <Text className="text-slate-500 mt-1">
              Share your feedback about this appointment.
            </Text>

            <View className="flex-row mt-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSelectedRating(value)}
                  className={`w-11 h-11 rounded-xl mr-2 items-center justify-center border ${
                    selectedRating === value
                      ? 'bg-brand-600 border-brand-600'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={`font-bold ${selectedRating === value ? 'text-white' : 'text-slate-700'}`}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="Optional comment"
              multiline
              numberOfLines={3}
              className="mt-4 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800"
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleSubmitRating}
              disabled={isSubmittingRating}
              className="bg-brand-600 rounded-2xl py-4 flex-row items-center justify-center mt-4 active:opacity-92"
            >
              {isSubmittingRating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-[16px]">
                  {appointment.rating ? 'Update Rating' : 'Submit Rating'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={callClinic}
          className="bg-slate-950 rounded-2xl py-4 flex-row items-center justify-center mt-6 border border-slate-800 active:opacity-92 shadow-lg shadow-slate-900/20"
        >
          <Phone size={20} color="white" />
          <Text className="text-white font-bold text-[16px] ml-2">
            Call {appointment.practice_name || 'Clinic'}
          </Text>
        </TouchableOpacity>

        {appointment.status !== 'CANCELLED' && 
         appointment.status !== 'COMPLETED' && 
         !(appointment.diagnosis || appointment.prescription || appointment.clinical_notes || appointment.notes) && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={isCancelling}
            className="bg-red-50 rounded-2xl py-4 flex-row items-center justify-center mt-4 border border-red-200 active:opacity-92 shadow-sm shadow-red-900/5"
          >
            {isCancelling ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <>
                <XCircle size={20} color="#dc2626" />
                <Text className="text-red-600 font-bold text-[16px] ml-2">
                  Cancel Appointment
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>

      <AppAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        tone={alertState.tone}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onCancel={() => setAlertState((prev) => ({ ...prev, visible: false }))}
        onConfirm={async () => {
          const confirmAction = alertState.onConfirm;
          setAlertState((prev) => ({ ...prev, visible: false, onConfirm: null }));
          if (confirmAction) {
            await confirmAction();
          }
        }}
      />
    </View>
  );
};

export default PatientAppointmentDetailScreen;

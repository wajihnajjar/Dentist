import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import AppAlertModal from '../../components/AppAlertModal';
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
  Pill,
  FileText,
} from 'lucide-react-native';

const FIELD_MIN = 88;
const FIELD_EXPANDED = 168;

const DentistAppointmentDetailScreen = ({ route, navigation }) => {
  const { appointment: initial } = route.params;
  const [appointment, setAppointment] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [savingClinical, setSavingClinical] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [expandedField, setExpandedField] = useState(null);
  const insets = useSafeAreaInsets();
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
    cancelText: undefined,
    confirmText: 'OK',
    confirmVariant: undefined,
    onConfirm: () => {},
    onCancel: undefined,
  });

  const showAlert = (opts = {}) => {
    const { onConfirm: userOnConfirm, onCancel: userOnCancel, ...rest } = opts;
    setAlert({
      visible: true,
      tone: 'info',
      confirmText: 'OK',
      cancelText: undefined,
      confirmVariant: undefined,
      title: '',
      message: '',
      ...rest,
      onConfirm: () => {
        userOnConfirm?.();
        setAlert((a) => ({ ...a, visible: false }));
      },
      onCancel: rest.cancelText
        ? () => {
            userOnCancel?.();
            setAlert((a) => ({ ...a, visible: false }));
          }
        : undefined,
    });
  };

  const syncClinicalFromAppointment = useCallback((a) => {
    setDiagnosis(a?.diagnosis || '');
    setPrescription(a?.prescription || '');
    setClinicalNotes(a?.clinical_notes || a?.notes || '');
  }, []);

  useEffect(() => {
    syncClinicalFromAppointment(initial);
  }, [initial, syncClinicalFromAppointment]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.getAppointment(initial.id);
        if (!cancelled && data && !data.error) {
          setAppointment((prev) => ({ ...prev, ...data }));
          syncClinicalFromAppointment(data);
        }
      } catch (e) {
        console.warn('Could not refresh appointment:', e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [initial.id, syncClinicalFromAppointment]);

  const saveClinicalRecord = async () => {
    if (!diagnosis.trim() && !prescription.trim() && !clinicalNotes.trim()) {
      showAlert({
        title: 'Empty record',
        message: 'Add at least one of diagnosis, prescription, or clinical notes.',
        tone: 'danger',
      });
      return;
    }
    setSavingClinical(true);
    try {
      const response = await api.updateAppointmentDetails(appointment.id, {
        diagnosis: diagnosis.trim(),
        prescription: prescription.trim(),
        clinical_notes: clinicalNotes.trim(),
      });
      if (response.error) {
        showAlert({ title: 'Error', message: response.error, tone: 'danger' });
        return;
      }
      const merged = { ...appointment, diagnosis: diagnosis.trim(), prescription: prescription.trim(), clinical_notes: clinicalNotes.trim() };
      setAppointment(merged);
      showAlert({
        title: 'Saved',
        message: 'Clinical record updated.',
        tone: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Could not save clinical record.',
        tone: 'danger',
      });
    } finally {
      setSavingClinical(false);
    }
  };

  const confirm = () => {
    showAlert({
      title: 'Confirm visit',
      message: `Mark ${appointment.patient_name} as confirmed?`,
      tone: 'info',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      onCancel: () => {},
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await api.confirmAppointment(appointment.id);
          if (response.error) {
            showAlert({ title: 'Error', message: response.error, tone: 'danger' });
          } else {
            setAppointment((a) => ({ ...a, status: 'CONFIRMED' }));
          }
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Failed to confirm appointment.',
            tone: 'danger',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const cancelSlot = () => {
    showAlert({
      title: 'Release time slot',
      message: 'Are you sure you want to release this time slot?',
      tone: 'danger',
      cancelText: 'Keep',
      confirmText: 'Release',
      confirmVariant: 'danger',
      onCancel: () => {},
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await api.cancelAppointment(appointment.id);
          if (response.error) {
            showAlert({ title: 'Error', message: response.error, tone: 'danger' });
          } else {
            navigation.goBack();
          }
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Failed to cancel appointment.',
            tone: 'danger',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const inputBoxStyle = (fieldKey) => ({
    minHeight: expandedField === fieldKey ? FIELD_EXPANDED : FIELD_MIN,
    textAlignVertical: 'top',
  });

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center mb-4">
            <User size={18} color="#64748b" />
            <Text className="text-slate-900 text-lg font-bold ml-3 flex-1">{appointment.patient_name}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Calendar size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.appointment_date}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#64748b" />
            <Text className="text-slate-800 font-semibold ml-3">{appointment.start_time?.substring(0, 5)}</Text>
          </View>
          <View className="flex-row items-start mb-3">
            <Stethoscope size={18} color="#64748b" style={{ marginTop: 2 }} />
            <Text className="text-slate-800 font-semibold ml-3 flex-1">{appointment.treatment_type || 'General Consultation'}</Text>
          </View>
          {appointment.room ? (
            <View className="flex-row items-center mb-3">
              <MapPin size={18} color="#64748b" />
              <Text className="text-slate-800 font-semibold ml-3">{appointment.room}</Text>
            </View>
          ) : null}
          <View
            className={`self-start px-3 py-1.5 rounded-full ${
              appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED'
                ? 'bg-emerald-50'
                : 'bg-amber-50'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED'
                  ? 'text-emerald-700'
                  : 'text-amber-800'
              }`}
            >
              {appointment.status || 'PENDING'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm mt-4">
          <View className="flex-row items-center mb-1">
            <ClipboardList size={18} color="#0d9488" />
            <Text className="text-slate-900 font-bold ml-2 text-lg">Clinical record</Text>
          </View>
          <Text className="text-slate-500 text-xs mb-4 pl-8">
            Tap a field to expand it while you edit. Changes are saved when you tap Save.
          </Text>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Stethoscope size={16} color="#0d9488" />
              <Text className="text-slate-800 font-bold text-sm ml-2">Diagnosis</Text>
            </View>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] leading-snug"
              style={inputBoxStyle('diagnosis')}
              placeholder="Diagnosis..."
              placeholderTextColor="#94a3b8"
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
              onFocus={() => setExpandedField('diagnosis')}
              onBlur={() => setExpandedField(null)}
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Pill size={16} color="#0d9488" />
              <Text className="text-slate-800 font-bold text-sm ml-2">Prescription</Text>
            </View>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] leading-snug"
              style={inputBoxStyle('prescription')}
              placeholder="Medication, dosage..."
              placeholderTextColor="#94a3b8"
              value={prescription}
              onChangeText={setPrescription}
              multiline
              onFocus={() => setExpandedField('prescription')}
              onBlur={() => setExpandedField(null)}
            />
          </View>

          <View className="mb-2">
            <View className="flex-row items-center mb-2">
              <FileText size={16} color="#0d9488" />
              <Text className="text-slate-800 font-bold text-sm ml-2">Clinical notes</Text>
            </View>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] leading-snug"
              style={inputBoxStyle('notes')}
              placeholder="Additional notes..."
              placeholderTextColor="#94a3b8"
              value={clinicalNotes}
              onChangeText={setClinicalNotes}
              multiline
              onFocus={() => setExpandedField('notes')}
              onBlur={() => setExpandedField(null)}
            />
          </View>

          <TouchableOpacity
            onPress={saveClinicalRecord}
            disabled={savingClinical}
            className={`mt-4 rounded-2xl py-4 items-center bg-brand-600 border border-brand-500 ${savingClinical ? 'opacity-60' : 'active:opacity-90'}`}
          >
            {savingClinical ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-[16px]">Save clinical record</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-slate-500 text-xs mt-4 mb-2 px-1">
          Patient Phone: {appointment.phone || 'Not provided'}
        </Text>

        <View className={`flex-row mt-4 ${appointment.status === 'CONFIRMED' ? '' : 'gap-3'}`}>
          {appointment.status !== 'CONFIRMED' ? (
            <TouchableOpacity
              onPress={confirm}
              disabled={loading}
              className={`flex-1 bg-brand-600 rounded-2xl py-4 flex-row items-center justify-center active:opacity-92 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={cancelSlot}
            disabled={loading}
            className={`rounded-2xl py-4 flex-row items-center justify-center border border-red-200 bg-red-50 active:opacity-90 ${
              appointment.status === 'CONFIRMED' ? 'flex-1' : 'flex-1'
            } ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <>
                <X size={20} color="#dc2626" />
                <Text className="text-red-600 font-bold ml-2">Release slot</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppAlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        tone={alert.tone}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        confirmVariant={alert.confirmVariant}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
    </View>
  );
};

export default DentistAppointmentDetailScreen;

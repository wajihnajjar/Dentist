import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import AppAlertModal from '../../components/AppAlertModal';
import { ChevronLeft, Phone, Calendar, Stethoscope, Plus, FileText, Pill, X, PenLine } from 'lucide-react-native';

const FIELD_MIN = 88;
const FIELD_EXPANDED = 180;

const DentistPatientDetailScreen = ({ route, navigation }) => {
  const { patient } = route.params;
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);

  const recordsRef = useRef({});
  const [recordsByAppointment, setRecordsByAppointment] = useState({});

  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [clinicalModalMode, setClinicalModalMode] = useState('add');
  const [expandedField, setExpandedField] = useState(null);

  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
    cancelText: undefined,
    confirmText: 'OK',
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

  recordsRef.current = recordsByAppointment;

  useEffect(() => {
    const next = {};
    (patient.appointments || []).forEach((app) => {
      const d = app.diagnosis?.trim?.() || '';
      const p = app.prescription?.trim?.() || '';
      const n = (app.clinical_notes || app.notes || '').trim?.() || '';
      if (d || p || n) {
        next[app.id] = { diagnosis: d, prescription: p, notes: n };
      }
    });
    setRecordsByAppointment(next);
  }, [patient]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const meRes = await api.getMe();
        setProfile(meRes.profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const history = (patient.appointments || []).sort((a, b) => {
    const dateA = new Date(a.appointment_date + 'T' + (a.start_time || '00:00'));
    const dateB = new Date(b.appointment_date + 'T' + (b.start_time || '00:00'));
    return dateB - dateA;
  });

  const dial = () => {
    Linking.openURL(`tel:${patient.phone.replace(/\D/g, '')}`).catch(() =>
      showAlert({ title: 'Unable to open phone', message: 'Try on a device.', tone: 'danger' })
    );
  };

  const hasExistingClinical = (app, localOverride) => {
    const r = localOverride ?? recordsRef.current[app.id];
    const d = (r?.diagnosis || app.diagnosis || '').trim();
    const p = (r?.prescription || app.prescription || '').trim();
    const n = (r?.notes || app.clinical_notes || app.notes || '').trim();
    return !!(d || p || n);
  };

  const openRecordModal = (app) => {
    const r = recordsRef.current[app.id];
    setDiagnosis((r?.diagnosis ?? app.diagnosis ?? '').trim() || '');
    setPrescription((r?.prescription ?? app.prescription ?? '').trim() || '');
    setNotes((r?.notes ?? app.clinical_notes ?? app.notes ?? '').trim() || '');
    setSelectedAppointmentId(app.id);
    setClinicalModalMode(hasExistingClinical(app, r) ? 'edit' : 'add');
    setExpandedField(null);
    setIsNoteModalVisible(true);
  };

  const closeRecordModal = () => {
    setIsNoteModalVisible(false);
    setSelectedAppointmentId(null);
    setExpandedField(null);
  };

  const handleSaveRecord = async () => {
    if (!diagnosis.trim() && !prescription.trim() && !notes.trim()) {
      showAlert({
        title: 'Empty record',
        message: 'Please enter at least one field before saving.',
        tone: 'danger',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        diagnosis: diagnosis.trim(),
        prescription: prescription.trim(),
        clinical_notes: notes.trim(),
      };

      const response = await api.updateAppointmentDetails(selectedAppointmentId, payload);

      if (response.error) {
        showAlert({ title: 'Error', message: response.error, tone: 'danger' });
        return;
      }

      const newRecord = {
        diagnosis: diagnosis.trim(),
        prescription: prescription.trim(),
        notes: notes.trim(),
      };

      setRecordsByAppointment((prev) => ({
        ...prev,
        [selectedAppointmentId]: newRecord,
      }));

      closeRecordModal();
      showAlert({
        title: 'Saved',
        message: 'Clinical record saved.',
        tone: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to save clinical record.',
        tone: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
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
        <Text className="text-[22px] font-bold text-ink flex-1 tracking-tight" numberOfLines={1}>
          {patient.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm">
          <TouchableOpacity onPress={dial} className="flex-row items-center py-3 mt-2 active:opacity-80">
            <Phone size={18} color="#0d9488" />
            <Text className="text-brand-700 font-semibold ml-3">{patient.phone}</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-xs mt-4">
            Chart at {profile?.practice_name || profile?.full_name || 'My Clinic'}
          </Text>
        </View>

        <Text className="text-slate-800 font-bold text-lg mt-8 mb-1">Visit timeline</Text>
        <Text className="text-slate-500 text-[13px] mb-4">Newest first — tap a visit for details or to add notes.</Text>
        {history.length === 0 ? (
          <Text className="text-slate-500">No visits recorded.</Text>
        ) : (
          history.map((app, index) => {
            const record = recordsByAppointment[app.id];
            const hasRecord = hasExistingClinical(app, record);
            const isLast = index === history.length - 1;
            const d = (record?.diagnosis || app.diagnosis || '').trim();
            const p = (record?.prescription || app.prescription || '').trim();
            const n = (record?.notes || app.clinical_notes || app.notes || '').trim();
            const snippet = [d && 'Dx', p && 'Rx', n && 'Notes'].filter(Boolean).join(' · ') || null;

            return (
              <View key={app.id} className="flex-row items-stretch">
                <View className="w-[22px] items-center mr-3">
                  <View className="w-3.5 h-3.5 rounded-full bg-brand-500 border-2 border-white mt-1.5 z-10 shadow-sm shadow-brand-900/20" />
                  {!isLast ? <View className="w-0.5 flex-1 bg-slate-200 mt-1" /> : null}
                </View>
                <View className="flex-1 pb-7">
                  <View className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
                    <TouchableOpacity
                      onPress={() => navigation.navigate('DentistAppointmentDetail', { appointment: app })}
                      className="flex-row items-center"
                    >
                      <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
                        <Calendar size={18} color="#64748b" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-slate-900 font-semibold">
                          {app.appointment_date ? app.appointment_date.split('T')[0] : ''} ·{' '}
                          {(app.start_time || '').substring(0, 5)}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Stethoscope size={14} color="#94a3b8" />
                          <Text className="text-slate-500 text-sm ml-1" numberOfLines={1}>
                            {app.treatment_type || 'General Consultation'}
                          </Text>
                        </View>
                        {snippet ? (
                          <Text className="text-slate-400 text-[11px] mt-2 font-medium" numberOfLines={2}>
                            {snippet}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        className={`px-2 py-1 rounded-md ml-2 ${
                          app.status === 'CONFIRMED'
                            ? 'bg-emerald-50'
                            : app.status === 'CANCELLED'
                              ? 'bg-red-50'
                              : 'bg-amber-50'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            app.status === 'CONFIRMED'
                              ? 'text-emerald-700'
                              : app.status === 'CANCELLED'
                                ? 'text-red-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {app.status}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View className="h-[1px] bg-slate-100 my-3" />

                    {hasRecord ? (
                      <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() => openRecordModal(app)}
                        className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 active:border-brand-300"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-slate-800 font-bold text-sm">Clinical record</Text>
                          <View className="flex-row items-center">
                            <PenLine size={14} color="#0d9488" />
                            <Text className="text-brand-700 font-bold text-xs ml-1">Tap to edit</Text>
                          </View>
                        </View>

                        {d ? (
                          <View className="mb-2">
                            <View className="flex-row items-center mb-1">
                              <Stethoscope size={14} color="#0d9488" />
                              <Text className="text-slate-700 font-bold text-xs ml-1.5">Diagnosis</Text>
                            </View>
                            <Text className="text-slate-600 text-xs pl-5" numberOfLines={4}>
                              {d}
                            </Text>
                          </View>
                        ) : null}

                        {p ? (
                          <View className="mb-2">
                            <View className="flex-row items-center mb-1">
                              <Pill size={14} color="#0d9488" />
                              <Text className="text-slate-700 font-bold text-xs ml-1.5">Prescription</Text>
                            </View>
                            <Text className="text-slate-600 text-xs pl-5" numberOfLines={4}>
                              {p}
                            </Text>
                          </View>
                        ) : null}

                        {n ? (
                          <View>
                            <View className="flex-row items-center mb-1">
                              <FileText size={14} color="#0d9488" />
                              <Text className="text-slate-700 font-bold text-xs ml-1.5">Notes</Text>
                            </View>
                            <Text className="text-slate-600 text-xs pl-5" numberOfLines={5}>
                              {n}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => openRecordModal(app)}
                        className="flex-row items-center justify-center bg-brand-50 py-2.5 rounded-xl"
                      >
                        <Plus size={16} color="#0d9488" />
                        <Text className="text-brand-700 font-medium text-sm ml-1">Add clinical record</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={isNoteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeRecordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-slate-900/40"
        >
          <View className="bg-white rounded-t-[32px] p-6 max-h-[92%]">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-slate-900">
                {clinicalModalMode === 'edit' ? 'Update clinical record' : 'Add clinical record'}
              </Text>
              <TouchableOpacity onPress={closeRecordModal} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-500 text-xs mb-5 leading-5">
              Tap inside a field to expand it while you write. Save sends changes to this appointment only.
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 font-semibold mb-2">Diagnosis</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] mb-4"
                style={inputBoxStyle('diagnosis')}
                placeholder="Enter diagnosis..."
                placeholderTextColor="#94a3b8"
                value={diagnosis}
                onChangeText={setDiagnosis}
                multiline
                onFocus={() => setExpandedField('diagnosis')}
                onBlur={() => setExpandedField(null)}
              />

              <Text className="text-slate-700 font-semibold mb-2">Prescription</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] mb-4"
                style={inputBoxStyle('prescription')}
                placeholder="Medication, dosage..."
                placeholderTextColor="#94a3b8"
                value={prescription}
                onChangeText={setPrescription}
                multiline
                onFocus={() => setExpandedField('prescription')}
                onBlur={() => setExpandedField(null)}
              />

              <Text className="text-slate-700 font-semibold mb-2">Clinical notes</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-[15px] mb-6"
                style={inputBoxStyle('notes')}
                placeholder="Additional notes..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
                multiline
                onFocus={() => setExpandedField('notes')}
                onBlur={() => setExpandedField(null)}
              />

              <TouchableOpacity
                onPress={handleSaveRecord}
                disabled={isSaving}
                className={`rounded-2xl py-4 items-center justify-center mb-8 ${isSaving ? 'bg-brand-400' : 'bg-brand-600'}`}
              >
                <Text className="text-white font-bold text-lg">{isSaving ? 'Saving…' : 'Save record'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppAlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        tone={alert.tone}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
    </View>
  );
};

export default DentistPatientDetailScreen;

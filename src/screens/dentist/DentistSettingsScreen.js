import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import AppAlertModal from '../../components/AppAlertModal';
import { ChevronLeft, Clock, MapPin, Save } from 'lucide-react-native';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DentistSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
    onConfirm: () => {},
  });

  const showAlert = (opts = {}) => {
    const { onConfirm: userOnConfirm, ...rest } = opts;
    setAlert({
      visible: true,
      tone: 'info',
      title: '',
      message: '',
      ...rest,
      onConfirm: () => {
        userOnConfirm?.();
        setAlert((a) => ({ ...a, visible: false }));
      },
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getMe();
        setProfile(res.profile || res);
        setAddress(res.profile?.address || res.address || '');
        // Map existing schedules (handle both possible backend structures)
        const existing = res.schedules || res.profile?.schedule || res.profile?.schedules || [];
        
        // Build a complete week array (0-6) so user can toggle/edit
        const week = DAYS.map((dayName, index) => {
          // Handle both snake_case and camelCase from backend
          const found = existing.find(s => 
            (s.day_of_week !== undefined ? s.day_of_week : s.dayOfWeek) === index
          );
          
          let start = '09:00';
          let end = '17:00';
          
          if (found) {
            const fStart = found.start_time || found.startTime;
            const fEnd = found.end_time || found.endTime;
            if (fStart) start = fStart.substring(0, 5);
            if (fEnd) end = fEnd.substring(0, 5);
          }

          return {
            day_of_week: index,
            name: dayName,
            active: !!found,
            start_time: start,
            end_time: end
          };
        });
        setSchedules(week);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 1. Update Profile (Address)
      await api.updateProfile({ address });

      // 2. Update Schedules
      const activeSchedules = schedules
        .filter(s => s.active)
        .map(s => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          slot_duration_minutes: 30
        }));
        
      const res = await api.updateSchedule(activeSchedules);
      if (res.error) {
        showAlert({ title: 'Error', message: res.error, tone: 'danger' });
      } else {
        showAlert({
          title: 'Success',
          message: 'Settings updated successfully.',
          tone: 'success',
        });
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to update settings.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (index, field, value) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  if (loading) {
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
          <Text className="text-[26px] font-bold text-ink tracking-tight">Clinic settings</Text>
          <Text className="text-slate-500 text-[14px] mt-1">{profile?.practice_name || 'My Clinic'}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="bg-brand-600 px-4 py-2.5 rounded-full flex-row items-center active:opacity-80"
        >
          {saving ? <ActivityIndicator size="small" color="white" /> : <Save size={16} color="white" />}
          <Text className="text-white font-bold text-sm ml-1.5">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-[28px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/4 mb-4">
          <View className="flex-row items-start">
            <MapPin size={20} color="#0d9488" style={{ marginTop: 2 }} />
            <View className="flex-1 ml-3">
              <Text className="text-slate-500 text-xs font-semibold uppercase mb-1">Address</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium text-[15px]"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter clinic address"
                multiline
              />
            </View>
          </View>
          <View className="flex-row items-start mt-6 pt-5 border-t border-slate-100">
            <Clock size={20} color="#0d9488" />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-500 text-xs font-semibold uppercase">Working Hours</Text>
              </View>
              
              {schedules.map((item, idx) => (
                <View key={item.day_of_week} className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center w-24">
                    <Switch 
                      value={item.active} 
                      onValueChange={(val) => updateDay(idx, 'active', val)}
                      trackColor={{ true: '#99f6e4' }} 
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                    <Text className={`font-medium ml-1 ${item.active ? 'text-slate-900' : 'text-slate-400'}`}>
                      {item.name.substring(0, 3)}
                    </Text>
                  </View>
                  
                  {item.active ? (
                    <View className="flex-row items-center flex-1 justify-end">
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-16 text-center text-slate-800 font-medium text-[13px]"
                        value={item.start_time}
                        onChangeText={(val) => updateDay(idx, 'start_time', val)}
                        placeholder="09:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                      <Text className="text-slate-400 mx-2">-</Text>
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-16 text-center text-slate-800 font-medium text-[13px]"
                        value={item.end_time}
                        onChangeText={(val) => updateDay(idx, 'end_time', val)}
                        placeholder="17:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                  ) : (
                    <Text className="text-slate-400 text-[13px] italic flex-1 text-right">Closed</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <AppAlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        tone={alert.tone}
        onConfirm={alert.onConfirm}
      />
    </View>
  );
};

export default DentistSettingsScreen;

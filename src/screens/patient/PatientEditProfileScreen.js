import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Calendar, Lock, Mail } from 'lucide-react-native';
import { api } from '../../api/client';

const PatientEditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  console.log(profile)
  const insets = useSafeAreaInsets();
  
  const [fullName, setFullName] = useState(profile?.profile?.full_name || '');
  const [email, setEmail] = useState(profile?.user?.email || profile?.email || '');
  const [phone, setPhone] = useState(profile?.profile?.phone || '');
  const [dob, setDob] = useState(profile?.profile?.date_of_birth.split("T")[0] || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date_of_birth: dob.trim(),
      };
      
      if (newPassword.trim()) {
        if (!currentPassword.trim()) {
          setError('Current password is required to set a new password.');
          setIsSaving(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      
      const response = await api.updatePatientProfile(payload);
      
      if (response.error) {
        setError(response.error);
      } else {
        // Return to profile screen and ideally trigger a refresh, 
        // you might want to use context or navigation params to trigger reload in real app
        navigation.goBack();
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-canvas" 
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="px-5 flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm shadow-slate-900/6"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <Text className="text-[26px] font-bold text-ink tracking-tight">Edit Profile</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6">
            <Text className="text-red-700 font-medium text-sm">{error}</Text>
          </View>
        ) : null}

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Full Name
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <User size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Your full name"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Email Address
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Mail size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Your email address"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Phone Number
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Phone size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Your phone number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Date of Birth
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Calendar size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={dob}
              onChangeText={setDob}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Current Password
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Required to change password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            New Password
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Leave blank to keep current"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className={`rounded-[24px] h-16 flex-row items-center justify-center border shadow-sm shadow-brand-900/20 active:opacity-90 ${isSaving ? 'bg-brand-400 border-brand-400' : 'bg-brand-600 border-brand-500'}`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[17px] font-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PatientEditProfileScreen;
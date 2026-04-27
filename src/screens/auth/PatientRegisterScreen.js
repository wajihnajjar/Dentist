import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, ChevronLeft, ArrowRight, User, Phone, Calendar } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../api/client';

const PatientRegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.register({
        name,
        email,
        phone,
        dob,
        password,
        role: 'PATIENT',
      });

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        navigation.replace('PatientTabs');
      } else {
        Alert.alert('Registration Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="absolute top-0 left-0 right-0 h-96 bg-brand-600 rounded-b-[60px]" />
      <View className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-brand-500/50" />
      <View className="absolute top-32 -right-20 w-56 h-56 rounded-full bg-brand-400/40" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 28,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).springify()} className="px-6 mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center border border-white/20 mb-6"
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-[34px] font-bold tracking-tight">Create Account</Text>
          <Text className="text-brand-100 text-[16px] mt-2 leading-6">
            Join DentiConnect to book your next visit.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400).springify()}
          className="flex-1 bg-slate-50 rounded-t-[48px] px-6 pt-10 shadow-2xl shadow-slate-900/10"
        >
          <View className="mb-5">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              Full Name
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <User size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="John Doe"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
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
                placeholder="you@example.com"
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
                placeholder="+1 (555) 000-0000"
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

          <View className="mb-8">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              Password
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <Lock size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className="flex-row items-center justify-center bg-brand-600 h-16 rounded-[24px] shadow-lg shadow-brand-900/25 border border-brand-500/30 active:opacity-90 mb-6"
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Create Account</Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-auto pb-4">
            <Text className="text-slate-500 text-[15px]">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PatientLogin')} hitSlop={10}>
              <Text className="text-brand-700 font-bold text-[15px]">Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PatientRegisterScreen;
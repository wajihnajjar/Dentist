import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, ChevronLeft, ArrowRight, Stethoscope } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../api/client';

const DentistLoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login({ email, password });

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        navigation.replace('DentistTabs');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
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
      <View className="absolute top-0 left-0 right-0 h-96 bg-slate-950 rounded-b-[60px]" />
      <View className="absolute top-10 -right-20 w-72 h-72 rounded-full bg-slate-800/50" />
      <View className="absolute top-32 -left-20 w-56 h-56 rounded-full bg-slate-900/40" />

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
        <Animated.View entering={FadeInDown.duration(400).springify()} className="px-6 mb-10">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center border border-white/10 mb-8"
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-row items-center mb-3">
            <View className="bg-brand-500/20 p-2 rounded-xl border border-brand-400/30 mr-3">
              <Stethoscope size={20} color="#5eead4" />
            </View>
            <Text className="text-brand-300 text-[13px] font-bold uppercase tracking-widest">Provider Portal</Text>
          </View>
          <Text className="text-white text-[34px] font-bold tracking-tight">Welcome back, Dr.</Text>
          <Text className="text-slate-400 text-[16px] mt-2 leading-6">
            Sign in to manage your clinic and appointments.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400).springify()}
          className="flex-1 bg-slate-50 rounded-t-[48px] px-6 pt-10 shadow-2xl shadow-slate-900/10"
        >
          <View className="mb-6">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              Email Address
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <Mail size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="doctor@clinic.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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
            <TouchableOpacity className="self-end mt-3 px-2">
              <Text className="text-brand-600 font-bold text-[14px]">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="flex-row items-center justify-center bg-slate-950 h-16 rounded-[24px] shadow-lg shadow-slate-900/20 active:opacity-90 mb-6"
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Sign In to Dashboard</Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-auto pb-4">
            <Text className="text-slate-500 text-[15px]">New provider? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DentistRegister')} hitSlop={10}>
              <Text className="text-brand-600 font-bold text-[15px]">Register Clinic</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DentistLoginScreen;
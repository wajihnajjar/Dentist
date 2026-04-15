import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, ChevronLeft, ArrowRight, User, Stethoscope, BriefcaseMedical, MapPin } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const DentistRegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [coordinate, setCoordinate] = useState(null);

  const handleRegister = () => {
    // Simulated auth
    navigation.replace('DentistTabs');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="absolute top-0 left-0 right-0 h-96 bg-slate-950 rounded-b-[60px]" />
      <View className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-slate-800/50" />
      <View className="absolute top-32 -right-20 w-56 h-56 rounded-full bg-slate-900/40" />

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
            className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center border border-white/10 mb-6"
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-row items-center mb-3">
            <View className="bg-brand-500/20 p-2 rounded-xl border border-brand-400/30 mr-3">
              <BriefcaseMedical size={20} color="#5eead4" />
            </View>
            <Text className="text-brand-300 text-[13px] font-bold uppercase tracking-widest">Provider Portal</Text>
          </View>
          <Text className="text-white text-[34px] font-bold tracking-tight">Join Network</Text>
          <Text className="text-slate-400 text-[16px] mt-2 leading-6">
            Register your practice to start accepting bookings.
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
                placeholder="Dr. Sarah Smith"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              NPI / License Number
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <Stethoscope size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="e.g. 1234567890"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={license}
                onChangeText={setLicense}
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
                placeholder="doctor@clinic.com"
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
              Clinic Location
            </Text>
            <View className="bg-white rounded-[24px] border border-slate-200 shadow-sm shadow-slate-900/5 overflow-hidden">
              <View className="h-44 w-full">
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={(e) => setCoordinate(e.nativeEvent.coordinate)}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  {coordinate && (
                    <Marker
                      coordinate={coordinate}
                      pinColor="#0d9488"
                      title="Your Clinic"
                    />
                  )}
                </MapView>
              </View>
              <View className="p-4 flex-row items-center bg-white border-t border-slate-100">
                <MapPin size={18} color={coordinate ? "#0d9488" : "#94a3b8"} />
                <Text className={`ml-2 text-[14px] font-medium flex-1 ${coordinate ? "text-brand-700" : "text-slate-400"}`}>
                  {coordinate ? "Location selected" : "Tap on the map to pin your location"}
                </Text>
              </View>
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
            className="flex-row items-center justify-center bg-brand-600 h-16 rounded-[24px] shadow-lg shadow-brand-900/25 border border-brand-500/30 active:opacity-90 mb-6"
            activeOpacity={0.88}
          >
            <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Register Practice</Text>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-row justify-center mt-auto pb-4">
            <Text className="text-slate-500 text-[15px]">Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DentistLogin')} hitSlop={10}>
              <Text className="text-brand-700 font-bold text-[15px]">Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DentistRegisterScreen;
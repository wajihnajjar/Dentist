import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ShieldCheck, Stethoscope, Sparkles, User, ArrowRight, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setTimeout(() => {
      if (role === 'PATIENT') {
        navigation.navigate('PatientLogin');
      } else {
        navigation.navigate('DentistLogin');
      }
      setSelectedRole(null);
    }, 250);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="absolute top-0 left-0 right-0 h-2/3 bg-slate-950 rounded-b-[80px] overflow-hidden">
        <View className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/20" />
        <View className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-brand-400/10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).springify()} className="items-center mb-12">
          <View className="flex-row items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-6">
            <Sparkles size={16} color="#5eead4" />
            <Text className="text-white text-[13px] font-bold ml-2 tracking-widest uppercase">
              DentiConnect
            </Text>
          </View>
          <Text className="text-white text-[42px] font-bold tracking-tight leading-tight text-center">
            Welcome.
          </Text>
          <Text className="text-slate-400 text-[18px] mt-4 leading-7 text-center px-4">
            Are you looking to book a visit, or are you a provider managing a clinic?
          </Text>
        </Animated.View>

        <View className="flex-1 justify-center mt-4">
          <Animated.View entering={ZoomIn.delay(200).duration(500).springify()} className="mb-6">
            <TouchableOpacity
              onPress={() => handleRoleSelect('PATIENT')}
              activeOpacity={0.9}
              className={`bg-white rounded-[36px] p-6 border-2 shadow-xl shadow-slate-900/10 ${
                selectedRole === 'PATIENT' ? 'border-brand-500 bg-brand-50' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-6">
                <View className={`p-4 rounded-3xl ${selectedRole === 'PATIENT' ? 'bg-brand-100' : 'bg-slate-100'}`}>
                  <User size={32} color={selectedRole === 'PATIENT' ? '#0d9488' : '#64748b'} />
                </View>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${selectedRole === 'PATIENT' ? 'bg-brand-600' : 'bg-slate-50 border border-slate-200'}`}>
                  {selectedRole === 'PATIENT' ? (
                    <ArrowRight size={20} color="#ffffff" />
                  ) : (
                    <ChevronRight size={20} color="#cbd5e1" />
                  )}
                </View>
              </View>
              <Text className="text-ink text-[24px] font-bold tracking-tight mb-2">I'm a Patient</Text>
              <Text className="text-slate-500 text-[15px] leading-6 pr-4">
                Find nearby top-rated dentists, book appointments, and manage your health history.
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={ZoomIn.delay(350).duration(500).springify()}>
            <TouchableOpacity
              onPress={() => handleRoleSelect('DENTIST')}
              activeOpacity={0.9}
              className={`bg-white rounded-[36px] p-6 border-2 shadow-xl shadow-slate-900/10 ${
                selectedRole === 'DENTIST' ? 'border-slate-900 bg-slate-50' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-6">
                <View className={`p-4 rounded-3xl ${selectedRole === 'DENTIST' ? 'bg-slate-200' : 'bg-slate-100'}`}>
                  <Stethoscope size={32} color={selectedRole === 'DENTIST' ? '#0f172a' : '#64748b'} />
                </View>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${selectedRole === 'DENTIST' ? 'bg-slate-900' : 'bg-slate-50 border border-slate-200'}`}>
                  {selectedRole === 'DENTIST' ? (
                    <ArrowRight size={20} color="#ffffff" />
                  ) : (
                    <ChevronRight size={20} color="#cbd5e1" />
                  )}
                </View>
              </View>
              <Text className="text-ink text-[24px] font-bold tracking-tight mb-2">I'm a Doctor</Text>
              <Text className="text-slate-500 text-[15px] leading-6 pr-4">
                Manage your daily schedule, block out vacation days, and view patient details.
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)} className="mt-auto pt-8 items-center">
          <View className="flex-row items-center">
            <ShieldCheck size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-[13px] ml-2 font-medium">Secure & HIPAA Compliant Portal</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { ChevronLeft, Star, MapPin, Phone, GraduationCap, CalendarClock } from 'lucide-react-native';

const PatientDentistDetailScreen = ({ route, navigation }) => {
  const { dentist } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="relative h-80 w-full bg-slate-200">
          <Image 
            source={{ uri: dentist.image }} 
            className="absolute w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-slate-900/40" />
          <View className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          
          <View className="absolute bottom-6 left-6 right-6">
            <View className="flex-row items-center mb-2">
              <View className="bg-brand-500/20 px-3 py-1.5 rounded-full border border-brand-400/30 flex-row items-center">
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-white font-bold text-xs ml-1.5">{dentist.rating} Rating</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full border border-white/20 ml-2">
                <Text className="text-white font-bold text-xs">Accepting New Patients</Text>
              </View>
            </View>
            <Text className="text-white text-[32px] font-bold tracking-tight">{dentist.name}</Text>
            <Text className="text-slate-300 text-[16px] font-medium mt-1">{dentist.specialty}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute w-12 h-12 rounded-2xl bg-slate-900/40 items-center justify-center border border-white/20"
            style={{ top: insets.top + 10, left: 24 }}
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(400).springify()} className="px-6 pt-8">
          <Text className="text-[20px] font-bold text-ink mb-3 tracking-tight">About</Text>
          <Text className="text-slate-500 text-[15px] leading-7">
            {dentist.name} is a highly experienced {dentist.specialty.toLowerCase()} dedicated to providing exceptional dental care. With a focus on patient comfort and utilizing the latest technology, they ensure every visit is stress-free and effective.
          </Text>

          <View className="mt-8 bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-sm shadow-slate-900/5">
            <View className="flex-row items-start mb-5">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <GraduationCap size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Experience</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">10+ years in general and cosmetic dentistry.</Text>
              </View>
            </View>

            <View className="flex-row items-start mb-5">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <MapPin size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Location</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">Downtown Medical Center, Suite 402</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <Phone size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Contact</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">+1 (555) 123-4567</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        entering={SlideInDown.duration(400).springify()}
        className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200/80 px-5 pt-4 shadow-2xl shadow-slate-900/20"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Booking', { dentist })}
          className="flex-row items-center justify-center py-4 rounded-2xl bg-brand-600 border border-brand-500 shadow-lg shadow-brand-900/25 active:opacity-90"
          activeOpacity={0.88}
        >
          <CalendarClock size={22} color="white" />
          <Text className="font-bold text-[17px] ml-2 text-white">
            Book Appointment
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default PatientDentistDetailScreen;
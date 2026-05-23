import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { ChevronLeft, Star, MapPin, Phone, GraduationCap, CalendarClock } from 'lucide-react-native';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800';

const PatientDentistDetailScreen = ({ route, navigation }) => {
  const { dentist } = route.params;
  const insets = useSafeAreaInsets();
  const averageRating = Number(dentist.rating) || 0;
  const ratingCount = Number(dentist.rating_count) || 0;
  const reviews = Array.isArray(dentist.ratings) ? dentist.ratings : [];

  const formatRatedAt = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="relative h-80 w-full bg-slate-200">
          <Image 
            source={{ uri: dentist.image || DEFAULT_IMAGE }} 
            className="absolute w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-slate-900/40" />
          <View className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          
          <View className="absolute bottom-6 left-6 right-6">
            <View className="flex-row items-center mb-2">
              <View className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
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
          <View className="bg-white rounded-[24px] border border-slate-200/80 px-5 py-4 mb-6 flex-row items-center justify-between shadow-sm shadow-slate-900/5">
            <View className="flex-row items-center">
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-ink font-bold text-[18px] ml-2">
                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              </Text>
            </View>
            <Text className="text-slate-500 font-medium">
              {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
            </Text>
          </View>

          <Text className="text-[20px] font-bold text-ink mb-3 tracking-tight">About</Text>
          <Text className="text-slate-500 text-[15px] leading-7">
            {dentist.bio || `${dentist.name} is a highly experienced ${dentist.specialty?.toLowerCase() || 'dental professional'} dedicated to providing exceptional dental care. With a focus on patient comfort and utilizing the latest technology, they ensure every visit is stress-free and effective.`}
          </Text>

          <View className="mt-8 bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-sm shadow-slate-900/5">
            <View className="flex-row items-start mb-5">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <GraduationCap size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Experience & Education</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">
                  {dentist.years_of_experience ? `${dentist.years_of_experience}+ years in practice.\n` : ''}
                  {dentist.education ? `Educated at ${dentist.education}.` : ''}
                  {!dentist.years_of_experience && !dentist.education && 'Information not provided.'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-5">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <MapPin size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Location</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">
                  {dentist.address || 'Address not provided'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-brand-50 p-3 rounded-2xl border border-brand-100/60">
                <Phone size={22} color="#0d9488" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-ink font-bold text-[16px]">Contact</Text>
                <Text className="text-slate-500 text-sm mt-1 leading-5">{dentist.phone || 'Phone not provided'}</Text>
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-[20px] font-bold text-ink mb-3 tracking-tight">Patient Reviews</Text>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <View
                  key={`${review.appointment_id || index}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-3 shadow-sm shadow-slate-900/5"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Star size={15} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-slate-900 font-bold ml-1.5">
                        {Number(review.rating) || 0}/5
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs">
                      {formatRatedAt(review.rated_at)}
                    </Text>
                  </View>
                  {review.comment ? (
                    <Text className="text-slate-600 text-sm mt-2 leading-6">
                      {review.comment}
                    </Text>
                  ) : (
                    <Text className="text-slate-400 text-sm mt-2 italic">
                      No comment provided.
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5">
                <Text className="text-slate-500">No patient reviews yet.</Text>
              </View>
            )}
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
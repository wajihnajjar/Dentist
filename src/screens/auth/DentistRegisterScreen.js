import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, ChevronLeft, ArrowRight, User, Stethoscope, BriefcaseMedical, MapPin, Phone, Building2, GraduationCap, Award, Camera, Clock } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../api/client';

const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

const DentistRegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [license, setLicense] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [password, setPassword] = useState('');
  const [coordinate, setCoordinate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      // Optionally pre-set the coordinate to their current location
      setCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Schedule State
  const [schedule, setSchedule] = useState({
    1: { active: true, start: '09:00', end: '17:00' },
    2: { active: true, start: '09:00', end: '17:00' },
    3: { active: true, start: '09:00', end: '17:00' },
    4: { active: true, start: '09:00', end: '17:00' },
    5: { active: true, start: '09:00', end: '17:00' },
    6: { active: false, start: '09:00', end: '13:00' },
    0: { active: false, start: '09:00', end: '17:00' },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (localUri) => {
    if (!localUri) return null;
    
    // Cloudinary details from user input
    const CLOUD_NAME = 'dn6kxvylo';
    const UPLOAD_PRESET = 'ml_default'; // Needs to be set up in Cloudinary settings as an "unsigned" preset

    const data = new FormData();
    data.append('file', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'profile_photo.jpg',
    });
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      const result = await response.json();

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !license) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!coordinate) {
      Alert.alert('Location Missing', 'Please select your clinic location on the map.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload Image to Cloudinary first (if selected)
      let uploadedImageUrl = null;
      if (photo) {
        uploadedImageUrl = await uploadImageToCloudinary(photo);
        if (!uploadedImageUrl) {
           Alert.alert('Upload Failed', 'Could not upload your profile picture. Please try again.');
           setIsLoading(false);
           return;
        }
      }

      // 2. Prepare schedule for API
      const scheduleArray = Object.keys(schedule)
        .filter(day => schedule[day].active)
        .map(day => ({
          day_of_week: parseInt(day),
          start_time: schedule[day].start,
          end_time: schedule[day].end
        }));

      const data = await api.register({
        name,
        practiceName,
        license,
        email,
        phone,
        address,
        experience,
        education,
        image_url: uploadedImageUrl, // Send the secure Cloudinary URL to the backend
        password,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        role: 'DENTIST',
        schedule: scheduleArray
      });

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        navigation.replace('DentistTabs');
      } else {
        Alert.alert('Registration Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
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
          <View className="mb-6 items-center">
            <TouchableOpacity 
              onPress={pickImage}
              className="w-32 h-32 rounded-full bg-white border-2 border-slate-200 border-dashed items-center justify-center overflow-hidden shadow-sm"
            >
              {photo ? (
                <Image source={{ uri: photo }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Camera size={32} color="#94a3b8" />
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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
              Practice Name
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <Building2 size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="Smile Clinic"
                placeholderTextColor="#94a3b8"
                value={practiceName}
                onChangeText={setPracticeName}
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
              Clinic Address
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <MapPin size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="123 Dental St, Suite 100"
                placeholderTextColor="#94a3b8"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              Years of Experience
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <Award size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="e.g. 10"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-4 ml-1">
              Working Hours
            </Text>
            <View className="bg-white rounded-[32px] p-4 border border-slate-200 shadow-sm shadow-slate-900/5">
              {DAYS.map((day) => {
                const config = schedule[day.value];
                return (
                  <View key={day.value} className="flex-row items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <TouchableOpacity 
                      onPress={() => setSchedule(prev => ({
                        ...prev,
                        [day.value]: { ...config, active: !config.active }
                      }))}
                      className="flex-row items-center flex-1"
                    >
                      <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${config.active ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
                        {config.active && <View className="w-2 h-2 rounded-full bg-white" />}
                      </View>
                      <Text className={`font-bold text-[15px] ${config.active ? 'text-ink' : 'text-slate-400'}`}>{day.label}</Text>
                    </TouchableOpacity>
                    
                    {config.active && (
                      <View className="flex-row items-center">
                        <TextInput 
                          className="bg-slate-50 px-3 py-1.5 rounded-lg text-ink font-medium text-[13px] w-16 text-center"
                          value={config.start}
                          onChangeText={(t) => setSchedule(prev => ({
                            ...prev,
                            [day.value]: { ...config, start: t }
                          }))}
                        />
                        <Text className="mx-2 text-slate-400">-</Text>
                        <TextInput 
                          className="bg-slate-50 px-3 py-1.5 rounded-lg text-ink font-medium text-[13px] w-16 text-center"
                          value={config.end}
                          onChangeText={(t) => setSchedule(prev => ({
                            ...prev,
                            [day.value]: { ...config, end: t }
                          }))}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
              Education History
            </Text>
            <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
              <GraduationCap size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-[16px] text-ink font-medium"
                placeholder="e.g. NYU College of Dentistry"
                placeholderTextColor="#94a3b8"
                value={education}
                onChangeText={setEducation}
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
                  showsUserLocation={true}
                  initialRegion={initialRegion}
                  region={initialRegion}
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
            disabled={isLoading}
            className="flex-row items-center justify-center bg-brand-600 h-16 rounded-[24px] shadow-lg shadow-brand-900/25 border border-brand-500/30 active:opacity-90 mb-6"
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Register Practice</Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
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
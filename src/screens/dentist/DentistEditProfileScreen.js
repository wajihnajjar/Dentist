import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, Lock, Mail, Building2, Stethoscope, GraduationCap, MapPin, FileText, Briefcase, BadgeDollarSign, Map as MapIcon } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../api/client';

const STATES = ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabes', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous'];
const SPECIALTIES = ['General Dentist', 'Orthodontist', 'Endodontist', 'Periodontist', 'Oral Surgeon', 'Pediatric Dentist'];

const DentistEditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  console.log(profile)
  const insets = useSafeAreaInsets();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [practiceName, setPracticeName] = useState(profile?.practice_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  
  // New Fields
  const [address, setAddress] = useState(profile?.address || '');
  const [state, setState] = useState(profile?.state || profile?.city || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(profile?.years_of_experience?.toString() || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || profile?.practice_name || '');
  const [consultationFee, setConsultationFee] = useState(profile?.consultation_fee?.toString() || '');
  
  // Location Coordinates
  const [latitude, setLatitude] = useState(profile?.latitude ? Number(profile.latitude) : 36.8065); // Default to Tunis
  const [longitude, setLongitude] = useState(profile?.longitude ? Number(profile.longitude) : 10.1815);
  const [region, setRegion] = useState({
    latitude: profile?.latitude ? Number(profile.latitude) : 36.8065,
    longitude: profile?.longitude ? Number(profile.longitude) : 10.1815,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Modals
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isSpecialtyModalVisible, setIsSpecialtyModalVisible] = useState(false);
  
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
        practice_name: practiceName.trim(),
        bio: bio.trim(),
        address: address.trim(),
        state: state.trim(),
        years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        education: education.trim(),
        specialty: specialty.trim(),
        consultation_fee: consultationFee ? Number(consultationFee) : undefined,
        latitude: latitude,
        longitude: longitude,
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
      
      const response = await api.updateProfile(payload);
      
      if (response.error) {
        setError(response.error);
      } else {
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
              placeholder="Dr. Full Name"
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
            Specialty
          </Text>
          <TouchableOpacity 
            onPress={() => setIsSpecialtyModalVisible(true)}
            className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5"
          >
            <Stethoscope size={20} color="#94a3b8" />
            <Text className={`flex-1 ml-3 text-[16px] font-medium ${specialty ? 'text-ink' : 'text-slate-400'}`}>
              {specialty || 'Select Specialty'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Years of Experience
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <Briefcase size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="e.g. 5"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Education
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <GraduationCap size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="University / Degree"
              placeholderTextColor="#94a3b8"
              value={education}
              onChangeText={setEducation}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Consultation Fee (TND)
          </Text>
          <View className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5">
            <BadgeDollarSign size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="e.g. 50"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={consultationFee}
              onChangeText={setConsultationFee}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            State / Region
          </Text>
          <TouchableOpacity 
            onPress={() => setIsStateModalVisible(true)}
            className="flex-row items-center bg-white h-16 rounded-[24px] px-5 border border-slate-200 shadow-sm shadow-slate-900/5"
          >
            <MapPin size={20} color="#94a3b8" />
            <Text className={`flex-1 ml-3 text-[16px] font-medium ${state ? 'text-ink' : 'text-slate-400'}`}>
              {state || 'Select State'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2 ml-1">
            Clinic Location (Map)
          </Text>
          <View className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm shadow-slate-900/5">
            <MapView
              style={{ height: 200, width: '100%' }}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setLatitude(latitude);
                setLongitude(longitude);
              }}
            >
              <Marker
                coordinate={{ latitude, longitude }}
                draggable
                onDragEnd={(e) => {
                  setLatitude(e.nativeEvent.coordinate.latitude);
                  setLongitude(e.nativeEvent.coordinate.longitude);
                }}
              />
            </MapView>
            <View className="p-4 flex-row justify-between bg-slate-50">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] text-slate-400 uppercase font-bold">Latitude</Text>
                <Text className="text-ink font-medium text-xs">{latitude.toFixed(6)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-slate-400 uppercase font-bold">Longitude</Text>
                <Text className="text-ink font-medium text-xs">{longitude.toFixed(6)}</Text>
              </View>
            </View>
          </View>
          <Text className="text-[12px] text-slate-400 mt-2 ml-1 italic">
            Tap or drag marker to set clinic location
          </Text>
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
            Professional Bio
          </Text>
          <View className="flex-row bg-white rounded-[24px] px-5 py-4 border border-slate-200 shadow-sm shadow-slate-900/5 min-h-[120px]">
            <FileText size={20} color="#94a3b8" className="mt-1" />
            <TextInput
              className="flex-1 ml-3 text-[16px] text-ink font-medium"
              placeholder="Tell patients about your expertise..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={bio}
              onChangeText={setBio}
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
          className={`rounded-[24px] h-16 flex-row items-center justify-center border shadow-sm shadow-brand-900/20 active:opacity-90 mb-10 ${isSaving ? 'bg-brand-400 border-brand-400' : 'bg-brand-600 border-brand-500'}`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[17px] font-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Specialty Picker Modal */}
      <Modal
        visible={isSpecialtyModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-slate-950/40 justify-end">
          <View className="bg-white rounded-t-[40px] pt-6 pb-10 px-6 max-h-[70%]">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-2xl font-bold text-ink mb-6 text-center">Select Specialty</Text>
            <FlatList
              data={SPECIALTIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSpecialty(item);
                    setIsSpecialtyModalVisible(false);
                  }}
                  className={`p-5 mb-3 rounded-2xl border ${specialty === item ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Text className={`text-[16px] font-semibold ${specialty === item ? 'text-brand-700' : 'text-slate-700'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              onPress={() => setIsSpecialtyModalVisible(false)}
              className="mt-4 p-4 rounded-full bg-slate-100 items-center"
            >
              <Text className="text-slate-600 font-bold text-[16px]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Picker Modal */}
      <Modal
        visible={isStateModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-slate-950/40 justify-end">
          <View className="bg-white rounded-t-[40px] pt-6 pb-10 px-6 max-h-[70%]">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-2xl font-bold text-ink mb-6 text-center">Select Region</Text>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setState(item);
                    setIsStateModalVisible(false);
                  }}
                  className={`p-5 mb-3 rounded-2xl border ${state === item ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Text className={`text-[16px] font-semibold ${state === item ? 'text-brand-700' : 'text-slate-700'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              onPress={() => setIsStateModalVisible(false)}
              className="mt-4 p-4 rounded-full bg-slate-100 items-center"
            >
              <Text className="text-slate-600 font-bold text-[16px]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default DentistEditProfileScreen;
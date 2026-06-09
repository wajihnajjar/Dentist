import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, ChevronLeft, ArrowRight } from 'lucide-react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { api } from '../../api/client';
import AppAlertModal from '../../components/AppAlertModal';

WebBrowser.maybeCompleteAuthSession();

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.42 11.02 10.12 11.91v-8.43H7.08v-3.48h3.04V9.41c0-3 1.78-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.48h-2.79v8.43C19.58 23.09 24 18.1 24 12.07z"
      fill="#1877F2"
    />
  </Svg>
);

const PatientLoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Auth
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
  });

  // Facebook Auth
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleSocialBackendLogin('google', authentication.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleSocialBackendLogin('facebook', authentication.accessToken);
    }
  }, [fbResponse]);

  const handleSocialBackendLogin = async (provider, token) => {
    setIsLoading(true);
    try {
      const data = await api.socialLogin({
        provider,
        token,
        role: 'PATIENT'
      });

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        navigation.replace('PatientTabs');
      } else {
        showAlert({
          title: 'Login failed',
          message: data.error || `Failed to authenticate with ${provider}`,
          tone: 'danger',
        });
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: `An error occurred during ${provider} login.`,
        tone: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: 'Error',
        message: 'Please enter both email and password',
        tone: 'danger',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login({ email, password, role: "PATIENT"});

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        navigation.replace('PatientTabs');
      } else {
        showAlert({
          title: 'Login failed',
          message: data.error || 'Invalid credentials',
          tone: 'danger',
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        title: 'Connection error',
        message: 'Could not connect to the server. Please check your network.',
        tone: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      googlePromptAsync();
    } else if (provider === 'Facebook') {
      fbPromptAsync();
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="absolute top-0 left-0 right-0 h-96 bg-brand-600 rounded-b-[60px]" />
      <View className="absolute top-10 -right-20 w-72 h-72 rounded-full bg-brand-500/50" />
      <View className="absolute top-32 -left-20 w-56 h-56 rounded-full bg-brand-400/40" />

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
            className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center border border-white/20 mb-8"
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-[34px] font-bold tracking-tight">Welcome back</Text>
          <Text className="text-brand-100 text-[16px] mt-2 leading-6">
            Sign in to continue your dental journey.
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
                placeholder="you@example.com"
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
                <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Sign In</Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-slate-200" />
            <Text className="mx-4 text-slate-400 font-bold text-[12px] uppercase tracking-widest">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-slate-200" />
          </View>

          <View className="flex-row justify-between mb-8">
            <TouchableOpacity
              onPress={() => handleSocialLogin('Google')}
              className="flex-1 flex-row items-center justify-center bg-white h-16 rounded-[24px] border border-slate-200 shadow-sm shadow-slate-900/5 mr-3 active:bg-slate-50"
            >
              <GoogleIcon />
              <Text className="ml-3 text-ink font-bold text-[15px]">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialLogin('Facebook')}
              className="flex-1 flex-row items-center justify-center bg-white h-16 rounded-[24px] border border-slate-200 shadow-sm shadow-slate-900/5 active:bg-slate-50"
            >
              <FacebookIcon />
              <Text className="ml-3 text-ink font-bold text-[15px]">Facebook</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-auto pb-4">
            <Text className="text-slate-500 text-[15px]">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PatientRegister')} hitSlop={10}>
              <Text className="text-brand-600 font-bold text-[15px]">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <AppAlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        tone={alert.tone}
        onConfirm={alert.onConfirm}
      />
    </KeyboardAvoidingView>
  );
};

export default PatientLoginScreen;
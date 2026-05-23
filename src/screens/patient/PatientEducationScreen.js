import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayCircle, Clock, XCircle, Search, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

const VIDEOS = [
  {
    id: '1',
    title: 'How to Brush Your Teeth Properly',
    description: 'Learn the ADA recommended technique for brushing to prevent plaque buildup and protect your enamel.',
    duration: '3:45',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=600&h=350'
  },
  {
    id: '2',
    title: 'Flossing 101: The Right Way',
    description: 'Flossing is crucial for gum health. Watch this step-by-step guide to cleaning between your teeth effectively.',
    duration: '2:15',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1598256989800-fea5f67b5e40?auto=format&fit=crop&q=80&w=600&h=350'
  },
  {
    id: '3',
    title: 'What Causes Cavities?',
    description: 'Understand the science behind tooth decay, sugar consumption, and how to keep cavities away.',
    duration: '4:20',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=600&h=350'
  },
  {
    id: '4',
    title: 'Why Regular Dental Checkups Matter',
    description: 'Discover why visiting your dentist every 6 months can save you from painful and expensive treatments later.',
    duration: '5:00',
    url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600&h=350'
  }
];

const PatientEducationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeVideo, setActiveVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isIntro = route?.params?.isIntro || false;

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return VIDEOS;
    const query = searchQuery.toLowerCase();
    return VIDEOS.filter(
      (video) => 
        video.title.toLowerCase().includes(query) || 
        video.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="bg-slate-950 px-6 pb-8 rounded-b-[40px] border-b border-slate-800"
        style={{ paddingTop: insets.top + 14 }}
      >
        <View className="absolute bottom-8 right-6 w-40 h-40 rounded-full bg-brand-500/10" />
        
        {navigation?.canGoBack?.() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/10 w-10 h-10 rounded-xl items-center justify-center mb-4 border border-white/10"
          >
            <ChevronLeft size={24} color="#f8fafc" />
          </TouchableOpacity>
        )}

        <Text className="text-brand-300/90 text-[12px] font-bold uppercase tracking-[2px]">Education</Text>
        <Text className="text-white text-[30px] font-bold mt-2 tracking-tight leading-tight">
          Dental Care Center
        </Text>
        
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 mt-6 border border-white/10">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-white font-medium text-[15px]"
            placeholder="Search topics, videos..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <XCircle size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-6"
        contentContainerStyle={{ paddingBottom: isIntro ? insets.bottom + 140 : insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredVideos.length === 0 ? (
          <View className="items-center justify-center py-10 mt-10">
            <Search size={48} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-500 text-base font-medium mt-4">No videos found for "{searchQuery}"</Text>
          </View>
        ) : (
          filteredVideos.map((video) => (
          <View
            key={video.id}
            className="bg-white rounded-[24px] mb-5 border border-slate-200/80 shadow-sm shadow-slate-900/5 overflow-hidden"
          >
            {activeVideo === video.id ? (
              <View className="h-56 w-full bg-black relative">
                <Video
                  source={{ uri: video.url }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                />
                <TouchableOpacity 
                  onPress={() => setActiveVideo(null)}
                  className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full"
                >
                  <XCircle size={24} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setActiveVideo(video.id)}
                className="h-40 w-full bg-slate-200 relative"
              >
                <Image 
                  source={{ uri: video.thumbnail }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-slate-900/30 items-center justify-center">
                  <View className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <PlayCircle size={40} color="white" strokeWidth={1.5} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            
            <View className="p-4">
              <Text className="text-slate-900 font-bold text-[18px] mb-1">{video.title}</Text>
              <Text className="text-slate-500 text-[13px] leading-5 mb-3">{video.description}</Text>
              
              <View className="flex-row items-center">
                <Clock size={14} color="#0d9488" />
                <Text className="text-brand-700 text-xs font-semibold ml-1.5">{video.duration}</Text>
              </View>
            </View>
          </View>
          ))
        )}
      </ScrollView>

      {isIntro && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-canvas/90 backdrop-blur-md" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Login')}
            className="bg-brand-600 rounded-[28px] py-4 flex-row items-center justify-center shadow-lg shadow-brand-900/20"
          >
            <Text className="text-white font-bold text-[17px] mr-2">Continue to Login</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PatientEducationScreen;
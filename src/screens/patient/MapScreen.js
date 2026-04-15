import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  TextInput,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { dentists } from '../../data/mockData';
import { Star, Search, SlidersHorizontal, MapPin } from 'lucide-react-native';
import SkeletonLoader from '../../components/SkeletonLoader';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const SPACING_FOR_CARD_INSET = width * 0.09;

const MapScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedDentist, setSelectedDentist] = useState(dentists[0] || null);
  const [isBestRatedFilter, setIsBestRatedFilter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const visibleDentists = useMemo(() => {
    let list = isBestRatedFilter ? [...dentists].sort((a, b) => b.rating - a.rating) : dentists;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
      );
    }
    return list;
  }, [isBestRatedFilter, query]);

  useEffect(() => {
    if (!visibleDentists.length) {
      setSelectedDentist(null);
      return;
    }
    setSelectedDentist((prev) => {
      if (prev && visibleDentists.some((d) => d.id === prev.id)) return prev;
      return visibleDentists[0];
    });
  }, [visibleDentists]);

  const onMarkerPress = (dentist, index) => {
    Keyboard.dismiss();
    setSelectedDentist(dentist);
    mapRef.current?.animateToRegion(
      {
        latitude: dentist.coordinate.latitude - 0.0045,
        longitude: dentist.coordinate.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      350
    );
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (index >= 0 && index < visibleDentists.length) {
      const dentist = visibleDentists[index];
      setSelectedDentist(dentist);
      mapRef.current?.animateToRegion(
        {
          latitude: dentist.coordinate.latitude - 0.0045,
          longitude: dentist.coordinate.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        350
      );
    }
  };

  const toggleBestRated = () => {
    setIsBestRatedFilter((v) => !v);
  };

  const cardsBottom = tabBarHeight + 12;

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <View className="flex-row justify-between mb-8">
          <SkeletonLoader width="68%" height={48} borderRadius={16} />
          <SkeletonLoader width="22%" height={48} borderRadius={16} />
        </View>
        <SkeletonLoader width="100%" height={420} borderRadius={24} />
        <View className="mt-6">
          <SkeletonLoader width="55%" height={20} borderRadius={8} className="mb-4" />
          <SkeletonLoader width="100%" height={110} borderRadius={22} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {visibleDentists.map((dentist, index) => (
          <Marker
            key={dentist.id}
            coordinate={dentist.coordinate}
            onPress={() => onMarkerPress(dentist, index)}
            title={dentist.name}
            description={dentist.specialty}
            pinColor={selectedDentist?.id === dentist.id ? '#0d9488' : '#64748b'}
          />
        ))}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.searchWrap}>
          <Search size={18} color="#64748b" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Clinic, specialty, or name"
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2.5 text-slate-800 text-[15px] py-0"
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <TouchableOpacity
          onPress={toggleBestRated}
          style={[styles.filterButton, isBestRatedFilter ? styles.filterButtonActive : null]}
          activeOpacity={0.88}
        >
          <SlidersHorizontal size={17} color={isBestRatedFilter ? 'white' : '#0d9488'} />
          <Text style={[styles.filterLabel, isBestRatedFilter ? styles.filterLabelActive : null]}>Top rated</Text>
        </TouchableOpacity>
      </View>

      {visibleDentists.length === 0 ? (
        <View style={[styles.emptyRail, { bottom: cardsBottom }]} className="mx-4">
          <View className="bg-white rounded-[28px] p-7 border border-slate-200/80 items-center shadow-xl shadow-slate-900/10">
            <View className="bg-slate-100 p-4 rounded-full mb-2">
              <MapPin size={28} color="#64748b" />
            </View>
            <Text className="text-ink font-bold text-xl mt-2 tracking-tight">No matches</Text>
            <Text className="text-slate-500 text-center mt-2 text-[15px] leading-6 px-2">
              Try another search or clear filters to see all providers.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setIsBestRatedFilter(false);
              }}
              className="mt-5 bg-slate-950 px-8 py-3.5 rounded-full border border-slate-800 active:opacity-92"
            >
              <Text className="text-white font-bold">Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <AnimatedFlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={visibleDentists}
          keyExtractor={(item) => item.id}
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: SPACING_FOR_CARD_INSET, paddingBottom: 4 }}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={[styles.cardsRail, { bottom: cardsBottom }]}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 200);
          }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }} className="px-2.5">
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => navigation.navigate('PatientDentistDetail', { dentist: item })}
                style={[styles.card, selectedDentist?.id === item.id ? styles.cardSelected : null]}
              >
                <Image source={{ uri: item.image }} className="w-[76px] h-[76px] rounded-2xl mr-3.5" />
                <View className="flex-1 pr-1 min-w-0">
                  <Text className="text-[17px] font-bold text-slate-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-brand-700 font-medium text-[14px] mt-0.5" numberOfLines={1}>
                    {item.specialty}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Star size={15} color="#f59e0b" fill="#fbbf24" />
                    <Text className="text-slate-700 font-bold ml-1 text-[14px]">{item.rating}</Text>
                    <Text className="text-slate-300 mx-2">·</Text>
                    <Text className="text-slate-500 text-xs">~12 min</Text>
                  </View>
                  <View style={styles.cta}>
                    <Text className="text-white text-center font-bold text-[15px] tracking-wide">View Profile</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0c1222',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0c1222',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  filterButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterLabel: {
    color: '#0d9488',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  filterLabelActive: { color: 'white' },
  cardsRail: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  emptyRail: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0c1222',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 12,
  },
  cardSelected: {
    borderColor: '#0d9488',
    shadowColor: '#0d9488',
    shadowOpacity: 0.12,
  },
  cta: {
    backgroundColor: '#0c1222',
    borderRadius: 999,
    paddingVertical: 11,
    marginTop: 12,
  },
});

export default MapScreen;

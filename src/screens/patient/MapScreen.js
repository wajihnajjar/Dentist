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
  Modal,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { api } from '../../api/client';
import { Star, Search, SlidersHorizontal, MapPin, X, Navigation, Banknote, Columns2 } from 'lucide-react-native';
import SkeletonLoader from '../../components/SkeletonLoader';
import { findFirstSlotOnDate, findNextAvailableSlot } from '../../utils/slotUtils';

const SORT_OPTIONS = [
  { id: 'distance', label: 'Closest', Icon: Navigation, needsLocation: true },
  { id: 'rating', label: 'Best rating', Icon: Star, needsLocation: false },
  { id: 'price', label: 'Lowest fee', Icon: Banknote, needsLocation: false },
];

const RADIUS_PRESETS = [
  { label: 'Any', km: null },
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: '25 km', km: 25 },
  { label: '50 km', km: 50 },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const SPACING_FOR_CARD_INSET = width * 0.09;

const DEFAULT_DOCTOR_IMAGE = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400';

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const formatSlotDay = (iso) => {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const nowHHmm = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const MapScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [isLoading, setIsLoading] = useState(true);
  const [dentists, setDentists] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All Regions');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [sortMode, setSortMode] = useState('distance');
  const [radiusKm, setRadiusKm] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [customRadiusText, setCustomRadiusText] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [nextSlotById, setNextSlotById] = useState({});
  const [availabilityEnabled, setAvailabilityEnabled] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);
  const [availabilityTime, setAvailabilityTime] = useState(nowHHmm());
  const [availabilityById, setAvailabilityById] = useState({});

  const STATES = ['All Regions', 'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabes', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous'];
  const SPECIALTIES = ['All Specialties', 'General Dentist', 'Orthodontist', 'Endodontist', 'Periodontist', 'Oral Surgeon', 'Pediatric Dentist'];
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get User Location
        let { status } = await Location.requestForegroundPermissionsAsync();
        let userCoords = null;
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(userCoords);
          mapRef.current?.animateToRegion({
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }

        // 2. Fetch and Transform Dentist Data
        const rawData = await api.getDentists();
        // Ensure rawData is an array
        const dentistsArray = Array.isArray(rawData) ? rawData : (rawData?.dentists || []);
        
        // Transform DB fields to Frontend fields
        const transformedData = dentistsArray.map(d => {
          const lat = parseFloat(d.latitude) || 0;
          const lng = parseFloat(d.longitude) || 0;
          let dist = null;
          
          if (userCoords && lat !== 0) {
            dist = calculateDistance(userCoords.latitude, userCoords.longitude, lat, lng);
          }

          return {
            ...d,
            id: d.user_id || d.id,
            name: d.full_name || d.name,
            image: d.image_url || d.image || DEFAULT_DOCTOR_IMAGE,
            specialty: d.specialty || 'General Dentist',
            city: d.city || d.state || d.address || '',
            rating: Number(d.rating) || 0,
            rating_count: Number(d.rating_count) || 0,
            ratings: Array.isArray(d.ratings) ? d.ratings : [],
            consultation_fee: d.consultation_fee != null && d.consultation_fee !== '' ? Number(d.consultation_fee) : null,
            distance: dist,
            coordinate: {
              latitude: lat,
              longitude: lng
            }
          };
        }).filter(d => d.coordinate.latitude !== 0); // Filter out items with no location

        setDentists(transformedData);
        if (transformedData.length > 0) setSelectedDentist(transformedData[0]);
      } catch (error) {
        console.error('Failed to fetch dentists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const baseDentists = useMemo(() => {
    let list = dentists;
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
      );
    }

    if (selectedState !== 'All Regions') {
      list = list.filter((d) => d.city.toLowerCase().includes(selectedState.toLowerCase()));
    }

    if (selectedSpecialty !== 'All Specialties') {
      list = list.filter((d) => d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    }

    if (userLocation && radiusKm != null && radiusKm > 0) {
      list = list.filter((d) => d.distance != null && d.distance <= radiusKm);
    }

    const sorted = [...list];
    const effectiveSort = sortMode === 'distance' && !userLocation ? 'rating' : sortMode;

    if (effectiveSort === 'distance' && userLocation) {
      sorted.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    } else if (effectiveSort === 'rating') {
      sorted.sort((a, b) => {
        const dr = (b.rating || 0) - (a.rating || 0);
        if (dr !== 0) return dr;
        return (b.rating_count || 0) - (a.rating_count || 0);
      });
    } else if (effectiveSort === 'price') {
      sorted.sort((a, b) => {
        const fa = a.consultation_fee;
        const fb = b.consultation_fee;
        if (fa == null && fb == null) return 0;
        if (fa == null) return 1;
        if (fb == null) return -1;
        return fa - fb;
      });
    }

    return sorted;
  }, [query, selectedState, selectedSpecialty, dentists, userLocation, radiusKm, sortMode]);

  const visibleDentists = useMemo(() => {
    if (!availabilityEnabled) return baseDentists;
    return baseDentists.filter((d) => !!availabilityById[d.id]);
  }, [availabilityEnabled, baseDentists, availabilityById]);

  const displaySortMode =
    sortMode === 'distance' && !userLocation ? 'rating' : sortMode;

  const visibleIdsKey = useMemo(
    () => visibleDentists.slice(0, 14).map((d) => d.id).join(','),
    [visibleDentists]
  );

  useEffect(() => {
    let cancelled = false;
    const subset = visibleDentists.slice(0, 14);
    if (!subset.length) {
      setNextSlotById({});
      return;
    }
    (async () => {
      const next = {};
      for (const d of subset) {
        if (cancelled) return;
        try {
          const slot = await findNextAvailableSlot(
            (dentistId, date) => api.getSlots(dentistId, date),
            d.id,
            10
          );
          if (slot) next[d.id] = slot;
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setNextSlotById(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [visibleIdsKey]);

  const availabilityKey = useMemo(() => {
    if (!availabilityEnabled) return '';
    const ids = baseDentists.slice(0, 40).map((d) => d.id).join(',');
    return `${availabilityDate}|${availabilityTime}|${ids}`;
  }, [availabilityEnabled, availabilityDate, availabilityTime, baseDentists]);

  useEffect(() => {
    let cancelled = false;
    if (!availabilityEnabled) {
      setAvailabilityById({});
      return () => {
        cancelled = true;
      };
    }

    const subset = baseDentists.slice(0, 40);
    if (!subset.length) {
      setAvailabilityById({});
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const next = {};
      const minT = (availabilityTime || '').trim().substring(0, 5) || '00:00';
      const dateIso = (availabilityDate || '').trim().substring(0, 10);

      for (const d of subset) {
        if (cancelled) return;
        const t = await findFirstSlotOnDate(
          (dentistId, date) => api.getSlots(dentistId, date),
          d.id,
          dateIso,
          minT
        );
        if (t) next[d.id] = { date: dateIso, time: t };
      }
      if (!cancelled) setAvailabilityById(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [availabilityKey]);

  const toggleCompareId = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setCompareIds([]);
  };

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

  const applyCustomRadius = () => {
    const n = parseFloat(customRadiusText.replace(',', '.'));
    if (Number.isFinite(n) && n > 0) {
      setRadiusKm(n);
    }
  };

  const compareBarLift = compareIds.length >= 2 ? 54 : 0;
  const cardsBottom = tabBarHeight + 12 + compareBarLift;

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
        showsUserLocation={true}
        followsUserLocation={false}
        initialRegion={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : {
          latitude: 33.8869,
          longitude: 9.5375,
          latitudeDelta: 6.0,
          longitudeDelta: 4.0,
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

      <View style={[styles.topBar, { top: insets.top + 10, flexDirection: 'column', alignItems: 'stretch' }]}>
        <View className="flex-row items-center mb-2.5" style={{ gap: 8 }}>
          <View style={[styles.searchWrap, { flex: 1, marginBottom: 0 }]}>
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
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterIconButton}
            activeOpacity={0.88}
          >
            <SlidersHorizontal size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>
        {(radiusKm != null && userLocation) ||
        displaySortMode !== 'distance' ||
        (sortMode === 'distance' && !userLocation) ? (
          <Text
            className="text-white text-[11px] font-semibold mb-1.5 px-0.5"
            style={{
              textShadowColor: 'rgba(0,0,0,0.45)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {displaySortMode === 'distance' && 'Nearest first'}
            {displaySortMode === 'rating' && (sortMode === 'distance' && !userLocation ? 'Best rating (enable location for distance)' : 'Best rating first')}
            {displaySortMode === 'price' && 'Lowest consultation fee first'}
            {radiusKm != null && userLocation ? ` · Within ${radiusKm} km` : ''}
          </Text>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <TouchableOpacity
            onPress={() => {
              if (compareMode) exitCompareMode();
              else setCompareMode(true);
            }}
            style={[
              styles.filterChip,
              compareMode ? styles.filterChipActive : null,
              { marginRight: 8 },
            ]}
          >
            <View className="flex-row items-center">
              <Columns2 size={14} color={compareMode ? '#fff' : '#475569'} />
              <Text
                style={[styles.filterChipText, compareMode ? styles.filterChipTextActive : null, { marginLeft: 6 }]}
              >
                {compareMode ? 'Done' : 'Compare'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATES}
            keyExtractor={item => item}
            className="mb-2"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedState(item)}
                style={[
                  styles.filterChip,
                  selectedState === item ? styles.filterChipActive : null
                ]}
              >
                <Text style={[styles.filterChipText, selectedState === item ? styles.filterChipTextActive : null]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SPECIALTIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedSpecialty(item)}
                style={[
                  styles.filterChip,
                  selectedSpecialty === item ? styles.filterChipActive : null
                ]}
              >
                <Text style={[styles.filterChipText, selectedSpecialty === item ? styles.filterChipTextActive : null]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {visibleDentists.length === 0 ? (
        <View style={[styles.emptyRail, { bottom: cardsBottom }]} className="mx-4">
          <View className="bg-white rounded-[28px] p-7 border border-slate-200/80 items-center shadow-xl shadow-slate-900/10">
            <View className="bg-slate-100 p-4 rounded-full mb-2">
              <MapPin size={28} color="#64748b" />
            </View>
            <Text className="text-ink font-bold text-xl mt-2 tracking-tight">No matches</Text>
            <Text className="text-slate-500 text-center mt-2 text-[15px] leading-6 px-2">
              Try another search to see providers.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setSortMode('distance');
                setRadiusKm(null);
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
          renderItem={({ item }) => {
            const inCompare = compareIds.includes(item.id);
            return (
              <View style={{ width: CARD_WIDTH }} className="px-2.5">
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => {
                    if (compareMode) toggleCompareId(item.id);
                    else navigation.navigate('PatientDentistDetail', { dentist: item });
                  }}
                  style={[
                    styles.card,
                    selectedDentist?.id === item.id ? styles.cardSelected : null,
                    compareMode && inCompare ? { borderColor: '#0d9488', borderWidth: 2 } : null,
                  ]}
                >
                  {compareMode ? (
                    <View className="absolute top-3 right-3 z-10 bg-white/95 rounded-full w-7 h-7 items-center justify-center border border-slate-200">
                      <Text className="text-brand-700 font-bold text-xs">{inCompare ? '✓' : ''}</Text>
                    </View>
                  ) : null}
                  <Image source={{ uri: item.image }} className="w-[76px] h-[76px] rounded-2xl mr-3.5" />
                  <View className="flex-1 pr-1 min-w-0">
                    <Text className="text-[17px] font-bold text-slate-900" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-brand-700 font-medium text-[14px] mt-0.5" numberOfLines={1}>
                      {item.specialty}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Star size={15} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-slate-600 text-xs ml-1 font-semibold">
                        {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                      </Text>
                      <Text className="text-slate-400 text-xs ml-1">
                        ({item.rating_count || 0})
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1 flex-wrap">
                      <MapPin size={15} color="#64748b" />
                      <Text className="text-slate-500 text-xs ml-1">
                        {item.distance != null ? `${item.distance.toFixed(1)} km` : 'Distance n/a'}
                      </Text>
                      {item.consultation_fee != null ? (
                        <Text className="text-slate-600 text-xs ml-2 font-semibold">
                          · {Number(item.consultation_fee).toFixed(0)} TND
                        </Text>
                      ) : null}
                    </View>
                    {nextSlotById[item.id] ? (
                      <View className="self-start mt-2 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                        <Text className="text-emerald-800 text-[10px] font-bold">
                          Next: {formatSlotDay(nextSlotById[item.id].date)} · {nextSlotById[item.id].time}
                        </Text>
                      </View>
                    ) : null}
                    {compareMode ? (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('PatientDentistDetail', { dentist: item })}
                        className="mt-3 py-2 border border-slate-200 rounded-xl"
                      >
                        <Text className="text-slate-700 text-center font-semibold text-[13px]">Open profile</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.cta}>
                        <Text className="text-white text-center font-bold text-[15px] tracking-wide">View Profile</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
          className="flex-1 bg-slate-950/50 justify-end"
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-white rounded-t-[28px] px-5 pt-4 border-t border-slate-200"
              style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-slate-900 text-xl font-bold">Filters</Text>
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Sort by</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {SORT_OPTIONS.map(({ id, label, Icon: SortIcon, needsLocation }) => {
                    const disabled = needsLocation && !userLocation;
                    const active = sortMode === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        disabled={disabled}
                        onPress={() => setSortMode(id)}
                        className={`flex-row items-center px-3.5 py-2.5 rounded-xl border ${
                          active ? 'bg-brand-50 border-brand-500' : 'bg-slate-50 border-slate-200'
                        } ${disabled ? 'opacity-45' : ''}`}
                      >
                        <SortIcon size={16} color={active ? '#0f766e' : '#64748b'} />
                        <Text
                          className={`ml-2 font-semibold text-[13px] ${active ? 'text-brand-800' : 'text-slate-700'}`}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {!userLocation ? (
                  <Text className="text-amber-700 text-sm mb-4 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                    Turn on location to use “Closest” and distance radius.
                  </Text>
                ) : null}

                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Max distance from you</Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {RADIUS_PRESETS.map(({ label, km }) => {
                    const active = radiusKm === km;
                    const disabled = !userLocation && km != null;
                    return (
                      <TouchableOpacity
                        key={label}
                        disabled={disabled}
                        onPress={() => setRadiusKm(km)}
                        className={`px-3.5 py-2 rounded-xl border ${
                          active ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                        } ${disabled ? 'opacity-45' : ''}`}
                      >
                        <Text className={`font-semibold text-[13px] ${active ? 'text-white' : 'text-slate-700'}`}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View className="flex-row items-center gap-2 mb-6">
                  <TextInput
                    value={customRadiusText}
                    onChangeText={setCustomRadiusText}
                    placeholder="Custom km"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    editable={!!userLocation}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium"
                  />
                  <TouchableOpacity
                    onPress={applyCustomRadius}
                    disabled={!userLocation}
                    className="bg-brand-600 px-4 py-2.5 rounded-xl active:opacity-90"
                  >
                    <Text className="text-white font-bold text-sm">Apply</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Availability</Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  <TouchableOpacity
                    onPress={() => {
                      setAvailabilityEnabled((v) => !v);
                      if (!availabilityEnabled) {
                        setAvailabilityDate(new Date().toISOString().split('T')[0]);
                        setAvailabilityTime(nowHHmm());
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl border ${
                      availabilityEnabled ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`font-semibold text-[13px] ${availabilityEnabled ? 'text-white' : 'text-slate-700'}`}>
                      {availabilityEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {availabilityEnabled ? (
                  <View className="flex-row gap-2 mb-6">
                    <TextInput
                      value={availabilityDate}
                      onChangeText={setAvailabilityDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium"
                      maxLength={10}
                    />
                    <TextInput
                      value={availabilityTime}
                      onChangeText={setAvailabilityTime}
                      placeholder="HH:mm"
                      placeholderTextColor="#94a3b8"
                      className="w-[92px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium text-center"
                      maxLength={5}
                    />
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => {
                    setSortMode('distance');
                    setRadiusKm(null);
                    setCustomRadiusText('');
                    setAvailabilityEnabled(false);
                    setAvailabilityById({});
                  }}
                  className="py-3 mb-2 items-center"
                >
                  <Text className="text-slate-500 font-semibold">Reset filters</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {compareIds.length >= 2 ? (
        <View
          className="absolute left-4 right-4 bg-slate-950 rounded-2xl px-4 py-3 flex-row items-center justify-between border border-slate-800 shadow-xl"
          style={{ bottom: tabBarHeight + 8 }}
        >
          <Text className="text-white font-semibold text-[14px] flex-1">
            {compareIds.length} selected — open comparison
          </Text>
          <TouchableOpacity
            onPress={() => {
              const picked = compareIds
                .map((id) => dentists.find((d) => d.id === id))
                .filter(Boolean);
              navigation.navigate('CompareDentists', { dentists: picked });
            }}
            className="bg-brand-500 px-4 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-[13px]">Compare</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {compareMode && compareIds.length > 0 && compareIds.length < 2 ? (
        <View
          className="absolute left-4 right-4 bg-slate-900/92 rounded-2xl px-4 py-2.5 border border-slate-700"
          style={{ bottom: tabBarHeight + 8 }}
        >
          <Text className="text-slate-200 text-center text-[12px]">
            Select at least 2 dentists (up to 3), then tap Compare.
          </Text>
        </View>
      ) : null}
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
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0c1222',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
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
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0c1222',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  filterChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  filterChipText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: 'white',
  },
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

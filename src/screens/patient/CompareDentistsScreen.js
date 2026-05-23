import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star, MapPin, Banknote, CalendarClock } from 'lucide-react-native';
import { api } from '../../api/client';
import { findNextAvailableSlot } from '../../utils/slotUtils';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400';

const CompareDentistsScreen = ({ route, navigation }) => {
  const { dentists = [] } = route.params || {};
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const next = [];
      for (const d of dentists) {
        if (cancelled) return;
        const id = d.user_id || d.id;
        let nextSlot = null;
        try {
          nextSlot = await findNextAvailableSlot((dentistId, date) => api.getSlots(dentistId, date), id, 14);
        } catch {
          nextSlot = null;
        }
        next.push({
          ...d,
          _id: id,
          nextSlot,
        });
      }
      if (!cancelled) {
        setRows(next);
        setLoading(false);
      }
    };
    if (dentists.length) load();
    else {
      setRows([]);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [dentists]);

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[22px] font-bold text-ink tracking-tight">Compare dentists</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{dentists.length} providers side by side</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0d9488" />
          <Text className="text-slate-500 mt-4">Loading next available times…</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((item) => (
            <View
              key={String(item._id)}
              className="bg-white rounded-[24px] p-5 mb-4 border border-slate-200/80 shadow-sm shadow-slate-900/5"
            >
              <View className="flex-row items-start">
                <Image
                  source={{ uri: item.image || item.image_url || DEFAULT_IMAGE }}
                  className="w-16 h-16 rounded-2xl mr-3"
                />
                <View className="flex-1 min-w-0">
                  <Text className="text-slate-900 font-bold text-lg" numberOfLines={2}>
                    {item.name || item.full_name}
                  </Text>
                  <Text className="text-brand-700 font-medium text-sm mt-0.5" numberOfLines={1}>
                    {item.specialty || 'General Dentist'}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-slate-100 my-4" />

              <View className="flex-row items-center mb-2">
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-slate-800 font-semibold ml-2">
                  {item.rating > 0 ? item.rating.toFixed(1) : 'New'} ({item.rating_count || 0} reviews)
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#64748b" />
                <Text className="text-slate-600 ml-2 flex-1">
                  {item.distance != null ? `${item.distance.toFixed(1)} km away` : 'Distance unknown'}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Banknote size={16} color="#64748b" />
                <Text className="text-slate-600 ml-2">
                  {item.consultation_fee != null && item.consultation_fee !== ''
                    ? `${Number(item.consultation_fee).toFixed(0)} TND consultation`
                    : 'Fee not listed'}
                </Text>
              </View>

              <View className="flex-row items-start mb-1">
                <CalendarClock size={16} color="#0d9488" style={{ marginTop: 2 }} />
                <View className="ml-2 flex-1">
                  <Text className="text-slate-500 text-xs font-bold uppercase tracking-wide">Next available</Text>
                  {item.nextSlot ? (
                    <Text className="text-slate-900 font-semibold mt-0.5">
                      {item.nextSlot.date} at {item.nextSlot.time}
                    </Text>
                  ) : (
                    <Text className="text-slate-500 mt-0.5">No slots found in the next 2 weeks</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('PatientDentistDetail', { dentist: item })}
                className="mt-4 bg-slate-950 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-white font-bold">View profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default CompareDentistsScreen;

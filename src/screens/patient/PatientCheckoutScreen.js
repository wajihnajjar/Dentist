import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, MapPin } from 'lucide-react-native';
import AppAlertModal from '../../components/AppAlertModal';

const formatTND = (value) => `${Number(value || 0).toFixed(3)} TND`;

const PatientCheckoutScreen = ({ route, navigation }) => {
  const { cart, products, onComplete, mode = 'shop', appointmentPayment } = route.params || {};
  const insets = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState('');
  const [cardType, setCardType] = useState('VISA');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    tone: 'info',
  });
  const [afterAlertAction, setAfterAlertAction] = useState(null);

  const showAlert = (title, message, tone = 'info', onConfirm) => {
    setAfterAlertAction(() => onConfirm || null);
    setAlertState({ visible: true, title, message, tone });
  };

  // Calculate totals
  const items = mode === 'appointment'
    ? [{
        id: `appointment-${appointmentPayment?.appointmentId || 'new'}`,
        name: appointmentPayment?.title || 'Appointment Fee',
        quantity: 1,
        price: Number(appointmentPayment?.amount) || 0,
      }]
    : Object.keys(cart || {}).map(id => {
        const product = (products || []).find(p => p.id === id);
        return { ...product, quantity: cart[id] };
      }).filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = mode === 'appointment' ? 0 : (subtotal > 0 ? 7.5 : 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax + deliveryFee;

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handlePayment = () => {
    if (mode !== 'appointment' && !address.trim()) {
      showAlert('Address Required', 'Please enter your delivery address to proceed.');
      return;
    }
    if (!cardName.trim()) {
      showAlert('Cardholder Required', 'Please enter the name on card.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      showAlert('Invalid Card Number', 'Please enter a valid 16-digit card number.', 'danger');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      showAlert('Invalid Expiry Date', 'Please use MM/YY format.', 'danger');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      showAlert('Invalid CVV', 'Please enter a valid CVV.', 'danger');
      return;
    }

    setProcessing(true);
    
    // Simulate a network request for payment processing
    setTimeout(() => {
      setProcessing(false);
      showAlert(
        'Payment Successful!', 
        mode === 'appointment'
          ? `Your appointment payment of ${formatTND(total)} is confirmed.`
          : `Your order of ${formatTND(total)} has been placed.`,
        'success',
        () => {
          if (onComplete) onComplete();
          if (mode === 'appointment') {
            navigation.navigate('PatientTabs', { screen: 'Bookings' });
          } else {
            navigation.goBack();
          }
        }
      );
    }, 1500);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View className="px-5 flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200/90 items-center justify-center mr-3 shadow-sm shadow-slate-900/6"
        >
          <ChevronLeft size={22} color="#0c1222" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[22px] font-bold text-ink tracking-tight">Checkout</Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            {mode === 'appointment' ? 'Pay for your appointment in Tunisian Dinar' : 'Secure payment in Tunisian Dinar'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <Text className="text-slate-800 font-bold text-lg mb-3">Order Summary</Text>
        <View className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/5 mb-6">
          {items.map((item, idx) => (
            <View 
              key={item.id} 
              className={`flex-row justify-between items-center py-3 ${idx !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 font-semibold" numberOfLines={1}>{item.name}</Text>
                <Text className="text-slate-500 text-xs mt-1">Qty: {item.quantity}</Text>
              </View>
              <Text className="text-slate-900 font-bold">{formatTND(item.price * item.quantity)}</Text>
            </View>
          ))}
          
          <View className="mt-4 pt-4 border-t border-dashed border-slate-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500">Subtotal</Text>
              <Text className="text-slate-700 font-medium">{formatTND(subtotal)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500">Delivery fee</Text>
              <Text className="text-slate-700 font-medium">{formatTND(deliveryFee)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500">Estimated Tax</Text>
              <Text className="text-slate-700 font-medium">{formatTND(tax)}</Text>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-100">
              <Text className="text-slate-900 font-bold text-lg">Total</Text>
              <Text className="text-brand-700 font-bold text-lg">{formatTND(total)}</Text>
            </View>
          </View>
        </View>

        {mode !== 'appointment' ? (
          <>
            <Text className="text-slate-800 font-bold text-lg mb-3">Delivery Address</Text>
            <View className="bg-white rounded-[26px] p-4 border border-slate-200/80 shadow-sm shadow-slate-900/5 mb-6">
              <View className="flex-row items-start">
                <MapPin size={20} color="#94a3b8" style={{ marginTop: 2 }} />
                <TextInput
                  className="flex-1 ml-3 text-slate-900 font-medium text-[15px]"
                  placeholder="Enter your full delivery address"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  autoCorrect={false}
                />
              </View>
            </View>
          </>
        ) : null}

        {/* Payment Info */}
        <Text className="text-slate-800 font-bold text-lg mb-3">Payment Method</Text>
        <View className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-sm shadow-slate-900/5 mb-6">
          <View className="flex-row mb-4">
            {['VISA', 'MASTERCARD'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setCardType(type)}
                className={`px-4 py-2.5 rounded-xl mr-2 border ${cardType === type ? 'bg-brand-50 border-brand-400' : 'bg-slate-50 border-slate-200'}`}
              >
                <Text className={`font-bold text-xs ${cardType === type ? 'text-brand-700' : 'text-slate-600'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 mb-3">
            <Text className="text-slate-500 text-xs mb-1">Cardholder name</Text>
            <TextInput
              value={cardName}
              onChangeText={setCardName}
              placeholder="Name on card"
              placeholderTextColor="#94a3b8"
              className="text-slate-900 font-medium"
              autoCorrect={false}
            />
          </View>

          <View className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 mb-3">
            <Text className="text-slate-500 text-xs mb-1">Card number</Text>
            <View className="flex-row items-center">
              <CreditCard size={18} color="#64748b" />
              <TextInput
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder={cardType === 'VISA' ? '4xxx xxxx xxxx xxxx' : '5xxx xxxx xxxx xxxx'}
                placeholderTextColor="#94a3b8"
                className="text-slate-900 font-medium ml-2 flex-1"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 mr-2">
              <Text className="text-slate-500 text-xs mb-1">Expiry (MM/YY)</Text>
              <TextInput
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiry(text))}
                placeholder="MM/YY"
                placeholderTextColor="#94a3b8"
                className="text-slate-900 font-medium"
                keyboardType="number-pad"
              />
            </View>
            <View className="w-28 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
              <Text className="text-slate-500 text-xs mb-1">CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                placeholder="***"
                placeholderTextColor="#94a3b8"
                className="text-slate-900 font-medium"
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pt-4 shadow-xl shadow-slate-900/10"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          onPress={handlePayment}
          disabled={processing}
          className={`bg-brand-600 rounded-[20px] py-4 flex-row items-center justify-center shadow-lg shadow-brand-900/30 ${processing ? 'opacity-70' : 'active:opacity-90'}`}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-[18px]">Pay {formatTND(total)}</Text>
          )}
        </TouchableOpacity>
      </View>

      <AppAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        tone={alertState.tone}
        onConfirm={() => {
          setAlertState((prev) => ({ ...prev, visible: false }));
          if (afterAlertAction) {
            const action = afterAlertAction;
            setAfterAlertAction(null);
            action();
          }
        }}
      />
    </View>
  );
};

export default PatientCheckoutScreen;
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, Plus, Minus, ShoppingBag, Search, XCircle } from 'lucide-react-native';

const PRODUCTS = [
  {
    id: '1',
    name: 'Pro-Clean Electric Toothbrush',
    description: 'Advanced sonic technology with 3 cleaning modes for a deeper clean.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Whitening Toothpaste',
    description: 'Enamel-safe formula that removes surface stains gently.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Premium Dental Floss',
    description: 'Mint flavored, shred-resistant floss that glides easily.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1598256989800-fea5f67b5e40?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    name: 'Antibacterial Mouthwash',
    description: 'Alcohol-free formula that kills 99% of bad breath germs.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1629363447545-564506ce2707?auto=format&fit=crop&q=80&w=400'
  }
];

const formatTND = (value) => `${Number(value || 0).toFixed(3)} TND`;

const PatientShopScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCTS;
    const query = searchQuery.toLowerCase();
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalPrice = useMemo(() => {
    return PRODUCTS.reduce((sum, product) => {
      const quantity = cart[product.id] || 0;
      return sum + product.price * quantity;
    }, 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cartTotalItems === 0) return;
    
    // Navigate to the Checkout Screen
    navigation.navigate('PatientCheckout', {
      cart,
      products: PRODUCTS,
      onComplete: () => setCart({}) // Clear the cart after successful payment
    });
  };

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View
        className="bg-slate-950 px-6 pb-8 rounded-b-[40px] border-b border-slate-800 z-10"
        style={{ paddingTop: insets.top + 14 }}
      >
        <View className="absolute -bottom-12 right-0 w-44 h-44 rounded-full bg-brand-500/10" />
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-brand-300/90 text-[12px] font-bold uppercase tracking-[2px]">Shop</Text>
            <Text className="text-white text-[30px] font-bold mt-2 tracking-tight leading-tight">
              Dental Store
            </Text>
            <Text className="text-slate-300 text-sm mt-2">
              Daily essentials for healthier smiles.
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleCheckout}
            className="bg-white/10 p-3.5 rounded-2xl relative border border-white/10 mt-1 active:opacity-80"
          >
            <ShoppingCart size={22} color="white" />
            {cartTotalItems > 0 && (
              <View className="absolute -top-2 -right-2 bg-brand-500 min-w-[20px] h-5 px-1 rounded-full items-center justify-center border-2 border-slate-950">
                <Text className="text-white text-[10px] font-bold">{cartTotalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 mt-6 border border-white/10">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-white font-medium text-[15px]"
            placeholder="Search products..."
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

      {/* Product List */}
      <ScrollView
        className="flex-1 px-5 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View className="items-center justify-center py-10 mt-10">
            <ShoppingBag size={48} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-500 text-base font-medium mt-4">No products found for "{searchQuery}"</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredProducts.map((product) => (
              <View
                key={product.id}
                className="w-[48%] bg-white rounded-[28px] mb-4 border border-slate-200/80 shadow-sm shadow-slate-900/5 overflow-hidden pb-4"
              >
                <View className="h-36 w-full bg-slate-100 p-4 items-center justify-center relative">
                  <Image 
                    source={{ uri: product.image }} 
                    className="w-full h-full rounded-2xl"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    <Text className="text-brand-700 font-bold text-[13px]">{formatTND(product.price)}</Text>
                  </View>
                </View>
                
                <View className="px-4 mt-3">
                  <Text className="text-slate-900 font-bold text-[15px] leading-5 mb-1" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text className="text-slate-500 text-[11px] leading-4 h-8" numberOfLines={2}>
                    {product.description}
                  </Text>
                  
                  <View className="mt-4">
                    {cart[product.id] ? (
                      <View className="flex-row items-center justify-between bg-brand-50 rounded-2xl p-1.5 border border-brand-100/60">
                        <TouchableOpacity 
                          onPress={() => removeFromCart(product.id)} 
                          className="bg-white w-8 h-8 rounded-xl items-center justify-center shadow-sm shadow-slate-900/5"
                        >
                          <Minus size={16} color="#0d9488" />
                        </TouchableOpacity>
                        <Text className="text-brand-800 font-bold text-[15px]">{cart[product.id]}</Text>
                        <TouchableOpacity 
                          onPress={() => addToCart(product.id)} 
                          className="bg-brand-600 w-8 h-8 rounded-xl items-center justify-center shadow-sm shadow-brand-900/20"
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => addToCart(product.id)}
                        className="bg-slate-900 py-3 rounded-2xl flex-row items-center justify-center active:opacity-80"
                      >
                        <ShoppingBag size={16} color="white" />
                        <Text className="text-white font-bold text-[13px] ml-2">Add to cart</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {cartTotalItems > 0 ? (
        <View
          className="absolute left-4 right-4 bg-white rounded-[24px] border border-slate-200/80 px-4 py-3 shadow-xl shadow-slate-900/10"
          style={{ bottom: (insets.bottom > 0 ? insets.bottom : 20) + 70 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-500 font-medium">
              {cartTotalItems} {cartTotalItems === 1 ? 'item' : 'items'} in cart
            </Text>
            <Text className="text-slate-900 font-bold">{formatTND(cartTotalPrice)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-slate-950 rounded-2xl py-3.5 items-center justify-center active:opacity-85"
          >
            <Text className="text-white font-bold text-[15px]">Proceed to checkout</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default PatientShopScreen;
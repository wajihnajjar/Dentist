import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';

const ICONS = {
  info: { Icon: Info, accent: '#0d9488', soft: 'rgba(13,148,136,0.12)' },
  success: { Icon: CheckCircle2, accent: '#059669', soft: 'rgba(5,150,105,0.12)' },
  danger: { Icon: AlertTriangle, accent: '#dc2626', soft: 'rgba(220,38,38,0.12)' },
};

/**
 * Styled in-app alerts (replacement for Alert.alert) with coherent UX across the app.
 * - Animated entrance / exit
 * - Tap outside to dismiss when cancel handler exists or dismissible
 * - Destructive primary action when tone is danger
 */
const AppAlertModal = ({
  visible,
  title,
  message,
  tone = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  /** When true, tapping backdrop behaves like Cancel (calls onCancel) */
  dismissible = true,
  /** Override confirm button style: primary (dark), danger (red), muted (outline) */
  confirmVariant,
}) => {
  const insets = useSafeAreaInsets();
  const iconConfig = ICONS[tone] || ICONS.info;
  const { Icon } = iconConfig;

  const resolvedConfirmVariant =
    confirmVariant ?? (tone === 'danger' && cancelText ? 'danger' : 'primary');

  const handleBackdropPress = () => {
    if (!visible) return;
    if (!dismissible) return;
    if (cancelText && onCancel) {
      onCancel();
    }
  };

  const confirmPressed = () => {
    if (onConfirm) onConfirm();
  };

  const cancelPressed = () => {
    if (onCancel) onCancel();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={cancelText ? cancelPressed : confirmPressed}
    >
      <Pressable
        className="flex-1 bg-black/55 justify-end px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        onPress={handleBackdropPress}
      >
        <Animated.View
          entering={FadeInDown.duration(260).springify()}
          exiting={FadeOut.duration(120)}
          className="w-full max-w-md self-center pb-2"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="overflow-hidden rounded-[32px] bg-white border border-slate-200/90"
              style={{
                shadowColor: '#0c1222',
                shadowOffset: { width: 0, height: 24 },
                shadowOpacity: 0.18,
                shadowRadius: 40,
                elevation: 24,
              }}
            >
              {/* Accent rail */}
              <View
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[32px]"
                style={{ backgroundColor: iconConfig.accent }}
              />

              <View className="px-6 pt-6 pb-5 pl-7">
                <View className="flex-row items-start">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: iconConfig.soft }}
                  >
                    <Icon size={28} color={iconConfig.accent} strokeWidth={2.25} />
                  </View>
                  <View className="flex-1 ml-3 pt-1">
                    <Text
                      className="text-[11px] font-bold uppercase tracking-[1.8px] mb-2"
                      style={{ color: iconConfig.accent }}
                    >
                      {tone === 'success' ? 'Success' : tone === 'danger' ? 'Attention' : 'Notice'}
                    </Text>
                    <Text className="text-slate-900 text-xl font-bold tracking-tight leading-6">{title}</Text>
                    {!!message ? (
                      <Text className="text-slate-500 text-[15px] mt-2.5 leading-6">{message}</Text>
                    ) : null}
                  </View>
                </View>

                <View className={`mt-7 ${cancelText ? 'gap-3' : ''}`}>
                  {cancelText ? (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={cancelPressed}
                        activeOpacity={0.85}
                        className="flex-1 py-4 rounded-2xl items-center justify-center bg-slate-100 border border-slate-200/90"
                      >
                        <Text className="text-slate-800 font-bold text-[15px]">{cancelText}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={confirmPressed}
                        activeOpacity={0.88}
                        className={`flex-1 py-4 rounded-2xl items-center justify-center ${
                          resolvedConfirmVariant === 'danger'
                            ? 'bg-red-600 border border-red-500'
                            : resolvedConfirmVariant === 'muted'
                              ? 'bg-white border-2 border-slate-200'
                              : 'bg-slate-950 border border-slate-800'
                        }`}
                      >
                        <Text
                          className={`font-bold text-[15px] ${
                            resolvedConfirmVariant === 'muted' ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {confirmText}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={confirmPressed}
                      activeOpacity={0.9}
                      className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg ${
                        resolvedConfirmVariant === 'danger'
                          ? 'bg-red-600 border border-red-500 shadow-red-900/25'
                          : 'bg-brand-600 border border-brand-500 shadow-brand-900/20'
                      }`}
                    >
                      <Text className="text-white font-bold text-[16px] tracking-wide">{confirmText}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default AppAlertModal;

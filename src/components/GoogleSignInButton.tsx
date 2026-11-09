import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import { GoogleLogo } from './GoogleLogo';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title?: string;
}

export function GoogleSignInButton({
  onPress,
  isLoading = false,
  disabled = false,
  title = 'Sign in with Google',
}: GoogleSignInButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        pressed && styles.buttonPressed,
        (disabled || isLoading) && styles.buttonDisabled,
      ]}>
      {isLoading ? (
        <ActivityIndicator color={isDark ? '#FFFFFF' : '#1F1F1F'} size="small" />
      ) : (
        <View style={styles.content}>
          <GoogleLogo size={20} />
          <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  buttonDark: {
    backgroundColor: '#131314',
    borderColor: '#8E918F',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textLight: {
    color: '#1F1F1F',
  },
  textDark: {
    color: '#E3E3E3',
  },
});

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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        styles.buttonLight,
        pressed && styles.buttonPressed,
        (disabled || isLoading) && styles.buttonDisabled,
      ]}>
      {isLoading ? (
        <ActivityIndicator color="#1F1F1F" size="small" />
      ) : (
        <View style={styles.content}>
          <GoogleLogo size={20} />
          <Text style={[styles.text, styles.textLight]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  buttonDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  buttonPressed: {
    opacity: 0.85,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textLight: {
    color: '#3C4043',
  },
  textDark: {
    color: '#3C4043',
  },
});

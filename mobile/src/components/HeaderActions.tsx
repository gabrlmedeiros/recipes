import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppButton } from './ui/AppButton';
import { useAuth } from '@/modules/auth';
import { useTheme } from '@/hooks/use-theme';

export function HeaderActions() {
  const router = useRouter();
  const { isDark, colors, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = React.useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logout();
    } catch {}
    setLogoutLoading(false);
    router.replace('/login');
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 }}>
      <Pressable onPress={toggleTheme} style={{ padding: 8, borderRadius: 8 }}>
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.textSecondary} />
      </Pressable>
      <AppButton
        title="Sair"
        variant="ghost"
        loading={logoutLoading}
        onPress={handleLogout}
        style={{ paddingVertical: 6, paddingHorizontal: 10 }}
        textStyle={{ fontSize: 13 }}
      />
    </View>
  );
}

export default HeaderActions;

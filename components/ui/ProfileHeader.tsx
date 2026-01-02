import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Edit, ChevronLeft } from 'lucide-react-native';

interface ProfileHeaderProps {
  name: string;
  email: string;
  phone: string;
  onEditPress?: () => void;
  onBackPress?: () => void;
  style?: ViewStyle;
}

export function ProfileHeader({
  name,
  email,
  phone,
  onEditPress,
  onBackPress,
  style
}: ProfileHeaderProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {onBackPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBackPress}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={colors.white} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Meu perfil</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEditPress}
        >
          <Edit size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfoContainer}>
        {/* Avatar */}
        <View style={styles.avatar} />
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userDetail}>{email}</Text>
          <Text style={styles.userDetail}>{phone}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg + 2, // 20px
    paddingBottom: spacing.xl + 18, // 42px
    paddingHorizontal: spacing.lg, // 20px
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 6, // 14px
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.xl,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 32,
  },
  userDetail: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.white,
    lineHeight: 16,
  },
});


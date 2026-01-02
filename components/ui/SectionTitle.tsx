import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ChevronRight, Clock, Star, Bell, Tag } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface SectionTitleProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
  iconName?: 'star' | 'clock' | 'bell' | 'tag';
  showTimer?: boolean;
  endDate?: Date;
  timerText?: string; // Fallback se endDate não for fornecido
  showLink?: boolean;
  linkText?: string;
  showDescription?: boolean;
  onLinkPress?: () => void;
  style?: ViewStyle;
}

export function SectionTitle({ 
  title = 'Title',
  description = 'Description',
  showIcon = true,
  iconName = 'star',
  showTimer = true,
  endDate,
  timerText: fallbackTimerText = '03:12:34',
  showLink = true,
  linkText = 'Ver tudo',
  showDescription = true,
  onLinkPress,
  style
}: SectionTitleProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>(fallbackTimerText);

  useEffect(() => {
    if (!endDate || !showTimer) {
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeRemaining(formattedTime);
    };

    // Atualizar imediatamente
    updateTimer();

    // Atualizar a cada segundo
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate, showTimer]);

  const displayTimerText = endDate ? timeRemaining : fallbackTimerText;

  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const getIcon = () => {
    const iconSize = 18;
    const iconColor = colors.white;
    
    switch (iconName) {
      case 'star':
        return <Star size={iconSize} color={iconColor} fill={iconColor} strokeWidth={2} />;
      case 'clock':
        return <Clock size={iconSize} color={iconColor} strokeWidth={2} />;
      case 'bell':
        return <Bell size={iconSize} color={iconColor} strokeWidth={2} />;
      case 'tag':
        return <Tag size={iconSize} color={iconColor} strokeWidth={2} />;
      default:
        return <Star size={iconSize} color={iconColor} fill={iconColor} strokeWidth={2} />;
    }
  };

  return (
    <View style={containerStyle}>
      {/* Icon Container */}
      {showIcon && (
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
      )}

      {/* Title and Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {showDescription && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {showLink && (
          <TouchableOpacity 
            onPress={onLinkPress}
            style={styles.linkContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>{linkText}</Text>
            <ChevronRight size={14} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}
        
        {showTimer && (
          <View style={styles.timerContainer}>
            <Clock size={14} color={colors.black} strokeWidth={2} />
            <Text style={styles.timerText}>{displayTimerText}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: spacing.md,
    paddingRight: 0, // Sem padding no lado direito
    width: '100%',
  },
  iconContainer: {
    width: 42,
    height: 42,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 18,
  },
  description: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  actionsContainer: {
    width: 81,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  timerContainer: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    width: '100%',
  },
  timerText: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
});


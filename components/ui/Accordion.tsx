import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../src/lib/styles';
import { useState, ReactNode } from 'react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  style?: ViewStyle;
}

export function Accordion({
  title,
  children,
  defaultExpanded = false,
  style,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <ChevronDown
          size={24}
          color={colors.black}
          strokeWidth={2}
          style={[
            styles.chevron,
            isExpanded && styles.chevronExpanded,
          ]}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});


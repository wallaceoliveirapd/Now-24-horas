import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../src/lib/styles';

interface Prop {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description?: string;
}

interface PropsTableProps {
  props: Prop[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Propriedades:
      </Text>
      {props.map((prop, index) => {
        const isLast = index === props.length - 1;

        return (
          <View 
            key={index} 
            style={[
              styles.item,
              !isLast && styles.itemBorder
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.propName}>
                {prop.name}
              </Text>
              {prop.required && (
                <Text style={styles.required}>*</Text>
              )}
              <Text style={styles.propType}>
                {prop.type}
              </Text>
            </View>
            {prop.default && (
              <Text style={styles.default}>
                Padrão: {prop.default}
              </Text>
            )}
            {prop.description && (
              <Text style={styles.description}>
                {prop.description}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm * 1.5,
  },
  item: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  propName: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.gray[900],
  },
  required: {
    ...typography.xs,
    color: '#dc2626',
    marginLeft: spacing.sm,
  },
  propType: {
    ...typography.xs,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
  default: {
    ...typography.xs,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.xs,
    color: colors.gray[700],
  },
});

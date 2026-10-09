import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
  sublabel?: string;
}

export const StatCard: React.FC<Props> = ({ icon, iconColor, value, label, sublabel }) => {
  const { colors } = useStudy();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {sublabel ? <Text style={[styles.sublabel, { color: iconColor }]}>{sublabel}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});

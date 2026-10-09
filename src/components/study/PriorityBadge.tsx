import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '@/types/study';
import { PriorityColors } from '@/constants/theme';

interface Props {
  priority: Priority;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const colors = PriorityColors[priority];
  const label = priority.toUpperCase();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

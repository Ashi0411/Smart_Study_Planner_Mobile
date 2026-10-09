import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subject } from '@/types/study';

interface Props {
  subject?: Subject;
  size?: 'sm' | 'md';
}

export const SubjectBadge: React.FC<Props> = ({ subject, size = 'md' }) => {
  if (!subject) return null;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: subject.color + '1A', borderColor: subject.color + '4D' },
        isSmall && styles.badgeSmall,
      ]}>
      <Ionicons
        name={(subject.icon as any) || 'book-outline'}
        size={isSmall ? 11 : 13}
        color={subject.color}
      />
      <Text
        style={[
          styles.text,
          { color: subject.color },
          isSmall && styles.textSmall,
        ]}>
        {subject.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});

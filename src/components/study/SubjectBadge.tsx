import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types/study';

interface Props {
  category?: Category | { name: string; color: string; icon: string };
  subcategoryName?: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<Props> = ({ category, subcategoryName, size = 'md' }) => {
  if (!category) return null;

  const isSmall = size === 'sm';

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { backgroundColor: category.color + '1A', borderColor: category.color + '4D' },
          isSmall && styles.badgeSmall,
        ]}>
        <Ionicons
          name={(category.icon as any) || 'folder-outline'}
          size={isSmall ? 11 : 13}
          color={category.color}
        />
        <Text
          style={[
            styles.text,
            { color: category.color },
            isSmall && styles.textSmall,
          ]}>
          {category.name}
        </Text>
      </View>

      {subcategoryName ? (
        <View
          style={[
            styles.subBadge,
            { backgroundColor: category.color + '12', borderColor: category.color + '33' },
            isSmall && styles.badgeSmall,
          ]}>
          <Text
            style={[
              styles.subText,
              { color: category.color },
              isSmall && styles.textSmall,
            ]}>
            {subcategoryName}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

// Backwards compatibility alias
export const SubjectBadge = CategoryBadge;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
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
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
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
    fontWeight: '700',
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});

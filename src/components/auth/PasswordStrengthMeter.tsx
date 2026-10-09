import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { evaluatePasswordStrength } from '@/utils/security';

interface Props {
  password: string;
}

export const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
  if (!password) return null;

  const { score, label, color, criteria } = evaluatePasswordStrength(password);

  const criteriaList = [
    { label: 'At least 8 characters', met: criteria.minLength },
    { label: 'Uppercase & Lowercase (A-Z, a-z)', met: criteria.hasUppercase && criteria.hasLowercase },
    { label: 'At least one number (0-9)', met: criteria.hasNumber },
    { label: 'Special symbol (!@#$...)', met: criteria.hasSpecialChar },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar Header with Score Label */}
      <View style={styles.headerRow}>
        <Text style={styles.securityTitle}>Password Security</Text>
        <Text style={[styles.securityLabel, { color }]}>{label}</Text>
      </View>

      {/* 4 Segment Progress Bars */}
      <View style={styles.barsRow}>
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <View
              key={step}
              style={[
                styles.barSegment,
                { backgroundColor: isActive ? color : '#E2E8F0' },
              ]}
            />
          );
        })}
      </View>

      {/* Criteria Checklist */}
      <View style={styles.checklist}>
        {criteriaList.map((item, index) => (
          <View key={index} style={styles.checkItem}>
            <Ionicons
              name={item.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={item.met ? '#10B981' : '#94A3B8'}
            />
            <Text
              style={[
                styles.checkText,
                { color: item.met ? '#10B981' : '#64748B' },
              ]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  securityLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  barsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  barSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  checklist: {
    gap: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

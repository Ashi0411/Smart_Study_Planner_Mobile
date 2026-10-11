import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
}

export const ModalAddWorkPlan: React.FC<Props> = ({
  visible,
  onClose,
  defaultCategoryId,
}) => {
  const { categories, addWorkPlan, colors } = useStudy();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategoryId || categories[0]?.id || ''
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(undefined);
  const [timeframeDays, setTimeframeDays] = useState<number>(7);
  const [intensity, setIntensity] = useState<'crash' | 'balanced' | 'light'>('balanced');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(undefined); // reset subcategory on category change
  };

  const handleSavePlan = () => {
    if (!title.trim()) return;

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + timeframeDays);
    const deadlineStr = deadlineDate.toISOString().split('T')[0];

    // Save work plan without sub-plans
    addWorkPlan({
      title: title.trim(),
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      targetDeadline: deadlineStr,
      subPlans: [],
    });

    // Reset & close
    setTitle('');
    setSelectedSubcategoryId(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.aiBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={[styles.aiBadgeText, { color: colors.primary }]}>WORK PLAN</Text>
              </View>
              <Text style={[styles.heading, { color: colors.text }]}>Add Custom Work Plan</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Goal Title Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>WORK PLAN NAME / GOAL</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="e.g. Master Network Pentesting, University Sem 2 Exams, IELTS Prep"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Category Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>SELECT CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleCategoryChange(cat.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? cat.color : colors.backgroundElement,
                        borderColor: isSelected ? cat.color : colors.cardBorder,
                      },
                    ]}>
                    <Ionicons
                      name={(cat.icon as any) || 'folder'}
                      size={14}
                      color={isSelected ? '#FFF' : cat.color}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                      ]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Subcategories (if available for selected category) */}
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <View style={styles.subCatSection}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  SUBCATEGORY (OPTIONAL)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
                  <Pressable
                    onPress={() => setSelectedSubcategoryId(undefined)}
                    style={[
                      styles.subPill,
                      {
                        backgroundColor: !selectedSubcategoryId ? selectedCategory.color : colors.backgroundElement,
                        borderColor: !selectedSubcategoryId ? selectedCategory.color : colors.cardBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.subPillText,
                        { color: !selectedSubcategoryId ? '#FFF' : colors.text },
                      ]}>
                      All / General
                    </Text>
                  </Pressable>

                  {selectedCategory.subcategories.map((sub) => {
                    const isSelected = selectedSubcategoryId === sub.id;
                    return (
                      <Pressable
                        key={sub.id}
                        onPress={() => setSelectedSubcategoryId(sub.id)}
                        style={[
                          styles.subPill,
                          {
                            backgroundColor: isSelected ? selectedCategory.color : colors.backgroundElement,
                            borderColor: isSelected ? selectedCategory.color : colors.cardBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.subPillText,
                            { color: isSelected ? '#FFF' : colors.text },
                          ]}>
                          {sub.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Timeframe */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>TIMEFRAME</Text>
            <View style={styles.pillGroup}>
              {[
                { label: '3 Days', days: 3 },
                { label: '1 Week', days: 7 },
                { label: '2 Weeks', days: 14 },
                { label: '1 Month', days: 30 },
              ].map((t) => (
                <Pressable
                  key={t.label}
                  onPress={() => setTimeframeDays(t.days)}
                  style={[
                    styles.timePill,
                    {
                      backgroundColor: timeframeDays === t.days ? colors.primary : colors.backgroundElement,
                      borderColor: timeframeDays === t.days ? colors.primary : colors.cardBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.timePillText,
                      { color: timeframeDays === t.days ? '#FFF' : colors.text },
                    ]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Study Intensity */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>STUDY INTENSITY</Text>
            <View style={styles.pillGroup}>
              {[
                { label: 'Crash Course 🔥', value: 'crash' },
                { label: 'Balanced Pace ⚖️', value: 'balanced' },
                { label: 'Light Routine 🌿', value: 'light' },
              ].map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setIntensity(p.value as any)}
                  style={[
                    styles.timePill,
                    {
                      backgroundColor: intensity === p.value ? colors.primary : colors.backgroundElement,
                      borderColor: intensity === p.value ? colors.primary : colors.cardBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.timePillText,
                      { color: intensity === p.value ? '#FFF' : colors.text },
                    ]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSavePlan}
              disabled={!title.trim()}
              style={[
                styles.btn,
                { backgroundColor: title.trim() ? selectedCategory?.color || colors.primary : colors.cardBorder },
              ]}>
              <Text style={[styles.btnText, { color: '#FFF' }]}>Save Work Plan</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  subCatSection: {
    marginTop: 6,
  },
  subPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

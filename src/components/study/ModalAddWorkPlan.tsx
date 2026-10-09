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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { SubPlan } from '@/types/study';
import { generateAISubPlans } from '@/services/aiPlanGenerator';

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
  const { categories, addWorkPlan, addTask, colors } = useStudy();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategoryId || categories[0]?.id || ''
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(undefined);
  const [timeframeDays, setTimeframeDays] = useState<number>(7);
  const [intensity, setIntensity] = useState<'crash' | 'balanced' | 'light'>('balanced');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [subPlans, setSubPlans] = useState<SubPlan[]>([]);
  const [autoAddToTasks, setAutoAddToTasks] = useState<boolean>(true);

  // Manual subplan input
  const [newSubPlanTitle, setNewSubPlanTitle] = useState('');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const selectedSubcategory = selectedCategory?.subcategories.find(
    (s) => s.id === selectedSubcategoryId
  );

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(undefined); // reset subcategory on category change
  };

  const handleGenerateAI = () => {
    if (!title.trim() || !selectedCategory) return;

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateAISubPlans({
        goalTitle: title.trim(),
        categoryName: selectedCategory.name,
        subcategoryName: selectedSubcategory?.name,
        timeframeDays,
        intensity,
      });
      setSubPlans(generated);
      setIsGenerating(false);
    }, 600);
  };

  const handleAddManualSubPlan = () => {
    if (!newSubPlanTitle.trim()) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + timeframeDays);

    const manualItem: SubPlan = {
      id: `manual-${Date.now()}`,
      title: newSubPlanTitle.trim(),
      estimatedMinutes: 45,
      completed: false,
      dueDate: targetDate.toISOString().split('T')[0],
    };
    setSubPlans([...subPlans, manualItem]);
    setNewSubPlanTitle('');
  };

  const handleRemoveSubPlan = (subPlanId: string) => {
    setSubPlans(subPlans.filter((sp) => sp.id !== subPlanId));
  };

  const handleSavePlan = () => {
    if (!title.trim()) return;

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + timeframeDays);
    const deadlineStr = deadlineDate.toISOString().split('T')[0];

    // Save work plan
    addWorkPlan({
      title: title.trim(),
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      targetDeadline: deadlineStr,
      subPlans,
    });

    // Optionally auto-add into tasks list
    if (autoAddToTasks && subPlans.length > 0) {
      subPlans.forEach((sp) => {
        addTask({
          title: `${title.trim()}: ${sp.title}`,
          categoryId: selectedCategoryId,
          subcategoryId: selectedSubcategoryId,
          dueDate: sp.dueDate || deadlineStr,
          priority: 'high',
          estimatedMinutes: sp.estimatedMinutes,
        });
      });
    }

    // Reset & close
    setTitle('');
    setSubPlans([]);
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
                <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI ASSISTANT</Text>
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

            {/* AI Generator Button */}
            <Pressable
              onPress={handleGenerateAI}
              disabled={!title.trim() || isGenerating}
              style={[
                styles.aiGenBtn,
                {
                  backgroundColor: title.trim() ? colors.primary : colors.cardBorder,
                  opacity: title.trim() ? 1 : 0.6,
                },
              ]}>
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#FFF" />
              )}
              <Text style={styles.aiGenBtnText}>
                {isGenerating
                  ? 'AI Bot generating structured sub-plans...'
                  : '✨ Generate Sub-Plans with AI Bot'}
              </Text>
            </Pressable>

            {/* Sub-Plans List */}
            {subPlans.length > 0 && (
              <View style={styles.subPlansWrapper}>
                <View style={styles.subPlansHeaderRow}>
                  <Text style={[styles.subPlansHeading, { color: colors.text }]}>
                    Generated Sub-Plans ({subPlans.length})
                  </Text>
                  <Text style={[styles.subPlansHelper, { color: colors.textSecondary }]}>
                    Milestones & phases
                  </Text>
                </View>

                {subPlans.map((sp, index) => (
                  <View
                    key={sp.id}
                    style={[
                      styles.subPlanCard,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                    ]}>
                    <View style={styles.subPlanHeader}>
                      <View style={[styles.stepCircle, { backgroundColor: selectedCategory?.color || colors.primary }]}>
                        <Text style={styles.stepNum}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.subPlanTitle, { color: colors.text }]}>{sp.title}</Text>
                      <Pressable onPress={() => handleRemoveSubPlan(sp.id)} hitSlop={6}>
                        <Ionicons name="close" size={16} color={colors.textSecondary} />
                      </Pressable>
                    </View>

                    {sp.description ? (
                      <Text style={[styles.subPlanDesc, { color: colors.textSecondary }]}>
                        {sp.description}
                      </Text>
                    ) : null}

                    <View style={styles.subPlanMeta}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {sp.estimatedMinutes} mins
                        </Text>
                      </View>

                      {sp.dueDate && (
                        <View style={styles.metaBadge}>
                          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            Target: {sp.dueDate}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Manual Sub-plan input */}
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>
              OR ADD CUSTOM SUB-PLAN
            </Text>
            <View style={styles.manualRow}>
              <TextInput
                style={[
                  styles.manualInput,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="e.g. Complete chapter summary notes"
                placeholderTextColor={colors.textSecondary}
                value={newSubPlanTitle}
                onChangeText={setNewSubPlanTitle}
              />
              <Pressable
                onPress={handleAddManualSubPlan}
                disabled={!newSubPlanTitle.trim()}
                style={[
                  styles.manualAddBtn,
                  {
                    backgroundColor: newSubPlanTitle.trim() ? colors.primary : colors.cardBorder,
                  },
                ]}>
                <Ionicons name="add" size={20} color="#FFF" />
              </Pressable>
            </View>

            {/* Auto-add into Daily Tasks Checkbox */}
            {subPlans.length > 0 && (
              <Pressable
                onPress={() => setAutoAddToTasks(!autoAddToTasks)}
                style={styles.checkboxRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: autoAddToTasks ? colors.primary : colors.textSecondary,
                      backgroundColor: autoAddToTasks ? colors.primary : 'transparent',
                    },
                  ]}>
                  {autoAddToTasks && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Automatically add these sub-plans into my Daily Tasks checklist
                </Text>
              </Pressable>
            )}
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
              <Text style={[styles.btnText, { color: '#FFF' }]}>
                Save Work Plan ({subPlans.length} sub-plans)
              </Text>
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
  aiGenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  aiGenBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subPlansWrapper: {
    marginTop: 14,
    gap: 8,
  },
  subPlansHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  subPlansHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  subPlansHelper: {
    fontSize: 11,
  },
  subPlanCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  subPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  subPlanTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  subPlanDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  subPlanMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  manualAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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

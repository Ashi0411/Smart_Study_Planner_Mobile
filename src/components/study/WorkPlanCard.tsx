import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkPlan } from '@/types/study';
import { useStudy } from '@/context/StudyContext';
import { CategoryBadge } from './SubjectBadge';

interface Props {
  plan: WorkPlan;
}

export const WorkPlanCard: React.FC<Props> = ({ plan }) => {
  const {
    toggleSubPlan,
    deleteWorkPlan,
    applyWorkPlanToTasks,
    getCategoryById,
    getSubcategoryById,
    getWorkPlanProgress,
    colors,
  } = useStudy();

  const [expanded, setExpanded] = useState<boolean>(true);

  const category = getCategoryById(plan.categoryId);
  const subcategory = getSubcategoryById(plan.categoryId, plan.subcategoryId);

  const totalSubPlans = plan.subPlans.length;
  const completedSubPlans = plan.subPlans.filter((sp) => sp.completed).length;
  const progressPercent = getWorkPlanProgress(plan.id);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {category && (
            <CategoryBadge
              category={category}
              subcategoryName={subcategory?.name}
              size="sm"
            />
          )}
          <Text style={[styles.title, { color: colors.text }]}>{plan.title}</Text>
        </View>

        <Pressable onPress={() => deleteWorkPlan(plan.id)} hitSlop={8} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Target Deadline & Progress Percentage */}
      <View style={styles.metaRow}>
        <View style={styles.deadlineContainer}>
          <Ionicons name="flag-outline" size={13} color={category?.color || colors.primary} />
          <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
            Target: {plan.targetDeadline}
          </Text>
        </View>

        <View style={[styles.percentageBadge, { backgroundColor: (category?.color || colors.primary) + '1A' }]}>
          <Text style={[styles.percentageText, { color: category?.color || colors.primary }]}>
            {completedSubPlans}/{totalSubPlans} done • {progressPercent}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundElement }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progressPercent}%`, backgroundColor: category?.color || colors.primary },
          ]}
        />
      </View>

      {/* Actions row */}
      <View style={styles.actionsBar}>
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandToggle}>
          <Text style={[styles.expandText, { color: colors.textSecondary }]}>
            {expanded ? 'Hide Sub-Plans' : `View ${totalSubPlans} Sub-Plans`}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textSecondary}
          />
        </Pressable>

        {totalSubPlans > completedSubPlans && (
          <Pressable
            onPress={() => applyWorkPlanToTasks(plan.id)}
            style={[styles.syncBtn, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="checkbox-outline" size={12} color={colors.primary} />
            <Text style={[styles.syncBtnText, { color: colors.primary }]}>Sync to Daily Tasks</Text>
          </Pressable>
        )}
      </View>

      {/* Sub-Plans Checklist */}
      {expanded && plan.subPlans.length > 0 && (
        <View style={styles.subPlansList}>
          {plan.subPlans.map((sp, idx) => (
            <Pressable
              key={sp.id}
              onPress={() => toggleSubPlan(plan.id, sp.id)}
              style={[
                styles.subPlanRow,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.cardBorder,
                  opacity: sp.completed ? 0.6 : 1,
                },
              ]}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: sp.completed
                      ? category?.color || colors.primary
                      : colors.textSecondary,
                    backgroundColor: sp.completed
                      ? category?.color || colors.primary
                      : 'transparent',
                  },
                ]}>
                {sp.completed && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>

              <View style={styles.subPlanInfo}>
                <Text
                  style={[
                    styles.subPlanTitle,
                    {
                      color: colors.text,
                      textDecorationLine: sp.completed ? 'line-through' : 'none',
                    },
                  ]}>
                  {idx + 1}. {sp.title}
                </Text>
                {sp.description ? (
                  <Text style={[styles.subPlanDesc, { color: colors.textSecondary }]}>
                    {sp.description}
                  </Text>
                ) : null}
                <View style={styles.subPlanMeta}>
                  <Text style={[styles.subPlanMins, { color: colors.textSecondary }]}>
                    ⏱️ {sp.estimatedMinutes}m {sp.dueDate ? `• Target: ${sp.dueDate}` : ''}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subPlansList: {
    marginTop: 10,
    gap: 8,
  },
  subPlanRow: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  subPlanInfo: {
    flex: 1,
  },
  subPlanTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  subPlanDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  subPlanMeta: {
    marginTop: 4,
  },
  subPlanMins: {
    fontSize: 10,
    fontWeight: '500',
  },
});

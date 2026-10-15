import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Subcategory } from '@/types/study';
import { useStudy } from '@/context/StudyContext';

interface Props {
  category: Category;
  onSelectCategory?: (categoryId: string) => void;
  onSelectSubcategory?: (category: Category, subcategory: Subcategory) => void;
}

export const CategoryCard: React.FC<Props> = ({
  category,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const {
    workPlans,
    tasks,
    addSubcategory,
    deleteSubcategory,
    deleteCategory,
    updateCategory,
    getCategoryProgress,
    colors,
  } = useStudy();

  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    updateCategory(category.id, {
      name: editName.trim(),
      color: category.color,
      icon: category.icon,
    });
    setIsEditing(false);
  };

  const plansInCat = workPlans.filter((p) => p.categoryId === category.id);
  const tasksInCat = tasks.filter((t) => t.categoryId === category.id);
  const progressPercent = getCategoryProgress(category.id);

  const handleAddSub = () => {
    if (!newSubName.trim()) return;
    addSubcategory(category.id, newSubName.trim());
    setNewSubName('');
    setIsAddingSub(false);
  };

  const handleDeleteCategory = () => {
    Alert.alert(
      `Delete "${category.name}"?`,
      'This will remove this category and its subcategories.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerLeft}
          onPress={() => onSelectCategory && onSelectCategory(category.id)}>
          <View style={[styles.iconWrap, { backgroundColor: category.color + '1A' }]}>
            <Ionicons
              name={(category.icon as any) || 'folder-outline'}
              size={22}
              color={category.color}
            />
          </View>
          {isEditing ? (
            <View style={styles.editTitleRow}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: category.color,
                  },
                ]}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onSubmitEditing={handleSaveEdit}
              />
              <Pressable
                onPress={handleSaveEdit}
                style={[styles.editSaveBtn, { backgroundColor: category.color }]}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </Pressable>
              <Pressable onPress={() => setIsEditing(false)} style={styles.editCancelBtn}>
                <Ionicons name="close" size={14} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.titleWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.name, { color: colors.text }]}>{category.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={category.color} />
              </View>
              <Text style={[styles.metaCount, { color: colors.textSecondary }]}>
                {plansInCat.length} Plans • {tasksInCat.length} Tasks • {category.subcategories.length} Subs
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.headerRight}>
          <View
            style={[
              styles.progressBadge,
              { backgroundColor: category.color + '18', borderColor: category.color + '4D' },
            ]}>
            <Text style={[styles.progressBadgeText, { color: category.color }]}>
              {progressPercent}%
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setEditName(category.name);
              setIsEditing(!isEditing);
            }}
            hitSlop={8}
            style={styles.actionIconBtn}>
            <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
          </Pressable>

          <Pressable onPress={handleDeleteCategory} hitSlop={8} style={styles.actionIconBtn}>
            <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundElement }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progressPercent}%`, backgroundColor: category.color },
          ]}
        />
      </View>

      {/* Subcategories list */}
      <View style={styles.subcategoriesContainer}>
        {category.subcategories.map((sub) => (
          <Pressable
            key={sub.id}
            onPress={() => onSelectSubcategory && onSelectSubcategory(category, sub)}
            style={({ pressed, hovered }: any) => [
              styles.subPill,
              { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
              hovered && { borderColor: category.color },
              pressed && { opacity: 0.8 },
            ]}>
            <Ionicons name="folder-outline" size={13} color={category.color} style={{ marginRight: 5 }} />
            <Text style={[styles.subPillText, { color: colors.text }]}>{sub.name}</Text>
            <Pressable
              onPress={(e: any) => {
                e?.stopPropagation?.();
                deleteSubcategory(category.id, sub.id);
              }}
              hitSlop={6}
              style={styles.subDel}>
              <Ionicons name="close" size={12} color={colors.textSecondary} />
            </Pressable>
          </Pressable>
        ))}

        {/* Add Subcategory Trigger */}
        {!isAddingSub ? (
          <Pressable
            onPress={() => setIsAddingSub(true)}
            style={[styles.addSubTrigger, { borderColor: category.color + '80' }]}>
            <Ionicons name="add" size={13} color={category.color} />
            <Text style={[styles.addSubTriggerText, { color: category.color }]}>Subcategory</Text>
          </Pressable>
        ) : (
          <View style={styles.newSubInline}>
            <TextInput
              style={[
                styles.inlineInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: category.color,
                },
              ]}
              placeholder="Subcategory name..."
              placeholderTextColor={colors.textSecondary}
              value={newSubName}
              onChangeText={setNewSubName}
              autoFocus
              onSubmitEditing={handleAddSub}
            />
            <Pressable
              onPress={handleAddSub}
              style={[styles.inlineAddBtn, { backgroundColor: category.color }]}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </Pressable>
            <Pressable onPress={() => setIsAddingSub(false)} style={styles.inlineCancelBtn}>
              <Ionicons name="close" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaCount: {
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  editTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  editSaveBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelBtn: {
    padding: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subDel: {
    padding: 2,
  },
  addSubTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addSubTriggerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  newSubInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    minWidth: 120,
  },
  inlineAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCancelBtn: {
    padding: 4,
  },
});

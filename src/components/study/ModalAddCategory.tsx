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
}

const COLOR_PRESETS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#0EA5E9', // Sky Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
];

const ICON_PRESETS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Uni', icon: 'school-outline' },
  { label: 'Security', icon: 'shield-checkmark-outline' },
  { label: 'Design', icon: 'color-palette-outline' },
  { label: 'Language', icon: 'language-outline' },
  { label: 'Personal', icon: 'fitness-outline' },
  { label: 'Code', icon: 'code-slash-outline' },
  { label: 'Books', icon: 'book-outline' },
  { label: 'Rocket', icon: 'rocket-outline' },
];

export const ModalAddCategory: React.FC<Props> = ({ visible, onClose }) => {
  const { addCategory, colors } = useStudy();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap>('school-outline');
  const [subcategoriesList, setSubcategoriesList] = useState<string[]>([]);
  const [newSubText, setNewSubText] = useState('');

  const handleAddSubcategory = () => {
    if (!newSubText.trim()) return;
    if (!subcategoriesList.includes(newSubText.trim())) {
      setSubcategoriesList([...subcategoriesList, newSubText.trim()]);
    }
    setNewSubText('');
  };

  const handleRemoveSubcategory = (subName: string) => {
    setSubcategoriesList(subcategoriesList.filter((s) => s !== subName));
  };

  const handleSaveCategory = () => {
    if (!name.trim()) return;
    addCategory(
      {
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
      },
      subcategoriesList
    );
    setName('');
    setSubcategoriesList([]);
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
            <Text style={[styles.heading, { color: colors.text }]}>Create Custom Category</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Category Name */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY NAME</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="e.g. University, Cybersecurity, UI/UX, Personal Goals"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            {/* Color Palette */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>THEME COLOR</Text>
            <View style={styles.colorsRow}>
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      isSelected && styles.colorDotSelected,
                    ]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </Pressable>
                );
              })}
            </View>

            {/* Icon Picker */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>ICON</Text>
            <View style={styles.iconsRow}>
              {ICON_PRESETS.map((item) => {
                const isSelected = selectedIcon === item.icon;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setSelectedIcon(item.icon)}
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor: isSelected ? selectedColor : colors.backgroundElement,
                        borderColor: isSelected ? selectedColor : colors.cardBorder,
                      },
                    ]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isSelected ? '#FFF' : colors.textSecondary}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Subcategories */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              SUBCATEGORIES (ADD AS MANY AS YOU LIKE)
            </Text>
            <View style={styles.subInputRow}>
              <TextInput
                style={[
                  styles.subInput,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="e.g. Network Security, Figma Mastery, Exams..."
                placeholderTextColor={colors.textSecondary}
                value={newSubText}
                onChangeText={setNewSubText}
                onSubmitEditing={handleAddSubcategory}
              />
              <Pressable
                onPress={handleAddSubcategory}
                disabled={!newSubText.trim()}
                style={[
                  styles.addSubBtn,
                  { backgroundColor: newSubText.trim() ? colors.primary : colors.cardBorder },
                ]}>
                <Ionicons name="add" size={18} color="#FFF" />
              </Pressable>
            </View>

            {/* Subcategories Chips */}
            {subcategoriesList.length > 0 && (
              <View style={styles.chipsWrap}>
                {subcategoriesList.map((sub) => (
                  <View
                    key={sub}
                    style={[
                      styles.subChip,
                      { backgroundColor: selectedColor + '1F', borderColor: selectedColor + '4D' },
                    ]}>
                    <Text style={[styles.subChipText, { color: selectedColor }]}>{sub}</Text>
                    <Pressable onPress={() => handleRemoveSubcategory(sub)} hitSlop={6}>
                      <Ionicons name="close" size={14} color={selectedColor} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSaveCategory}
              disabled={!name.trim()}
              style={[
                styles.btn,
                { backgroundColor: name.trim() ? selectedColor : colors.cardBorder },
              ]}>
              <Text style={[styles.btnText, { color: '#FFF' }]}>Save Category</Text>
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
    maxHeight: '85%',
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
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#FFF',
    transform: [{ scale: 1.15 }],
  },
  iconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  subInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  addSubBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  subChipText: {
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

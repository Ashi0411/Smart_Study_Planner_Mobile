import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { Category } from '@/types/study';
import { generateBotResponse, ChatMessage } from '@/services/aiStudyBot';

interface Props {
  visible: boolean;
  onClose: () => void;
  category: Category | null;
  initialSubcategoryId?: string;
}

export const ModalCategoryFolder: React.FC<Props> = ({
  visible,
  onClose,
  category,
  initialSubcategoryId,
}) => {
  const {
    colors,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    toggleTaskSubItem,
    addTaskSubItem,
    deleteTaskSubItem,
    addSubcategory,
    getCategoryProgress,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'folders' | 'ai'>('folders');
  const [selectedSubId, setSelectedSubId] = useState<string>(initialSubcategoryId || 'all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubTaskInputs, setNewSubTaskInputs] = useState<{ [taskId: string]: string }>({});
  const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-cat',
      sender: 'bot',
      text: `👋 Hi! I am your AI Study Companion for **"${category?.name || 'University Studies'}"**.\n\nI can help you:\n• Break down assignments into manageable steps 📋\n• Craft exam revision plans 🎯\n• Explain difficult topics & formulas 💡\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedSubtasks: [
        `Break down assignments for ${category?.name || 'this category'}`,
        `Create a 3-day revision roadmap`,
      ],
    },
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  if (!category) return null;

  const catColor = category.color || '#6366F1';
  const progressPercent = getCategoryProgress(category.id);

  // Filter tasks in this category and selected subcategory folder
  const categoryTasks = tasks.filter((t) => t.categoryId === category.id);
  const displayedTasks = categoryTasks.filter((t) => {
    if (selectedSubId === 'all') return true;
    return t.subcategoryId === selectedSubId;
  });

  const selectedSub = category.subcategories.find((s) => s.id === selectedSubId);
  const currentFolderName = selectedSub ? selectedSub.name : 'All Folders';

  const handleAddNewTask = () => {
    if (!newTaskTitle.trim()) return;
    const assignedSub = selectedSubId !== 'all' ? selectedSubId : category.subcategories[0]?.id;
    addTask({
      title: newTaskTitle.trim(),
      categoryId: category.id,
      subcategoryId: assignedSub,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      estimatedMinutes: 60,
      progressPercent: 0,
      subtasks: [],
    });
    setNewTaskTitle('');
  };

  const handleAddSubTaskToTask = (taskId: string) => {
    const text = newSubTaskInputs[taskId];
    if (!text || !text.trim()) return;
    addTaskSubItem(taskId, text.trim());
    setNewSubTaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return;
    addSubcategory(category.id, newFolderName.trim());
    setNewFolderName('');
    setIsAddingNewFolder(false);
  };

  const handleSendMessage = (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsBotThinking(true);

    setTimeout(() => {
      const response = generateBotResponse(textToSend, {
        taskTitle: `${category.name} - ${currentFolderName}`,
        categoryName: category.name,
        subcategoryName: currentFolderName,
      });

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSubtasks: response.suggestedSubtasks,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsBotThinking(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 600);
  };

  const handleApplyAISteps = (steps: string[]) => {
    if (steps.length === 0) return;
    const assignedSub = selectedSubId !== 'all' ? selectedSubId : category.subcategories[0]?.id;
    addTask({
      title: `${currentFolderName} AI Plan`,
      categoryId: category.id,
      subcategoryId: assignedSub,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      estimatedMinutes: 90,
      progressPercent: 0,
      subtasks: steps.map((s, idx) => ({
        id: `st-ai-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        title: s,
        completed: false,
      })),
    });
    setActiveTab('folders');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryIconCircle, { backgroundColor: catColor + '1E' }]}>
                <Ionicons
                  name={(category.icon as any) || 'school-outline'}
                  size={24}
                  color={catColor}
                />
              </View>
              <View>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                  {category.name}
                </Text>
                <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                  {category.subcategories.length} Folders • {categoryTasks.length} Tasks • {progressPercent}% Done
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Tab Selector: Folders & Tasks vs AI Study Bot */}
          <View style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}>
            <Pressable
              onPress={() => setActiveTab('folders')}
              style={[
                styles.tabBtn,
                activeTab === 'folders' && [styles.tabBtnActive, { backgroundColor: colors.card }],
              ]}>
              <Ionicons
                name="folder-open"
                size={16}
                color={activeTab === 'folders' ? catColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'folders' ? colors.text : colors.textSecondary },
                  activeTab === 'folders' && { fontWeight: '700' },
                ]}>
                Folders & Sub-tasks
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('ai')}
              style={[
                styles.tabBtn,
                activeTab === 'ai' && [styles.tabBtnActive, { backgroundColor: colors.card }],
              ]}>
              <Ionicons
                name="sparkles"
                size={16}
                color={activeTab === 'ai' ? '#8B5CF6' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'ai' ? '#8B5CF6' : colors.textSecondary },
                  activeTab === 'ai' && { fontWeight: '700' },
                ]}>
                AI Study Bot 🤖
              </Text>
            </Pressable>
          </View>

          {/* MAIN FOLDERS & SUB-TASKS TAB */}
          {activeTab === 'folders' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}>
              {/* Category Progress Banner */}
              <View style={[styles.progressBanner, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <View style={styles.progressBannerRow}>
                  <Text style={[styles.progressBannerLabel, { color: colors.textSecondary }]}>
                    OVERALL PROGRESS
                  </Text>
                  <Text style={[styles.progressBannerPercent, { color: catColor }]}>
                    {progressPercent}%
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.card }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%`, backgroundColor: catColor },
                    ]}
                  />
                </View>
              </View>

              {/* Subcategory Folders Selector */}
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                SUB-CATEGORY FOLDERS
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.foldersBar}
                contentContainerStyle={styles.foldersBarContent}>
                <Pressable
                  onPress={() => setSelectedSubId('all')}
                  style={[
                    styles.folderChip,
                    {
                      backgroundColor: selectedSubId === 'all' ? catColor : colors.backgroundElement,
                      borderColor: selectedSubId === 'all' ? catColor : colors.cardBorder,
                    },
                  ]}>
                  <Ionicons
                    name="grid-outline"
                    size={14}
                    color={selectedSubId === 'all' ? '#FFF' : catColor}
                  />
                  <Text
                    style={[
                      styles.folderChipText,
                      { color: selectedSubId === 'all' ? '#FFF' : colors.text },
                      selectedSubId === 'all' && { fontWeight: '700' },
                    ]}>
                    All ({categoryTasks.length})
                  </Text>
                </Pressable>

                {category.subcategories.map((sub) => {
                  const isSelected = selectedSubId === sub.id;
                  const taskCount = categoryTasks.filter((t) => t.subcategoryId === sub.id).length;
                  return (
                    <Pressable
                      key={sub.id}
                      onPress={() => setSelectedSubId(sub.id)}
                      style={[
                        styles.folderChip,
                        {
                          backgroundColor: isSelected ? catColor : colors.backgroundElement,
                          borderColor: isSelected ? catColor : colors.cardBorder,
                        },
                      ]}>
                      <Ionicons
                        name="folder-outline"
                        size={14}
                        color={isSelected ? '#FFF' : catColor}
                      />
                      <Text
                        style={[
                          styles.folderChipText,
                          { color: isSelected ? '#FFF' : colors.text },
                          isSelected && { fontWeight: '700' },
                        ]}>
                        {sub.name} ({taskCount})
                      </Text>
                    </Pressable>
                  );
                })}

                {/* + New Folder Button */}
                {!isAddingNewFolder ? (
                  <Pressable
                    onPress={() => setIsAddingNewFolder(true)}
                    style={[styles.addFolderBtn, { borderColor: catColor }]}>
                    <Ionicons name="add" size={14} color={catColor} />
                    <Text style={[styles.addFolderBtnText, { color: catColor }]}>+ Folder</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.newFolderInline, { backgroundColor: colors.backgroundElement, borderColor: catColor }]}>
                    <TextInput
                      style={[styles.newFolderInput, { color: colors.text }]}
                      placeholder="Folder name..."
                      placeholderTextColor={colors.textSecondary}
                      value={newFolderName}
                      onChangeText={setNewFolderName}
                      autoFocus
                      onSubmitEditing={handleCreateNewFolder}
                    />
                    <Pressable onPress={handleCreateNewFolder} style={[styles.miniCheckBtn, { backgroundColor: catColor }]}>
                      <Ionicons name="checkmark" size={13} color="#FFF" />
                    </Pressable>
                    <Pressable onPress={() => setIsAddingNewFolder(false)} style={styles.miniCloseBtn}>
                      <Ionicons name="close" size={13} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                )}
              </ScrollView>

              {/* Add New Task Input for Current Folder */}
              <View style={[styles.addTaskBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <Ionicons name="add-circle" size={20} color={catColor} />
                <TextInput
                  style={[styles.addTaskInput, { color: colors.text }]}
                  placeholder={`Add new task to ${currentFolderName}...`}
                  placeholderTextColor={colors.textSecondary}
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  onSubmitEditing={handleAddNewTask}
                />
                <Pressable
                  onPress={handleAddNewTask}
                  disabled={!newTaskTitle.trim()}
                  style={[styles.addTaskSubmitBtn, { backgroundColor: newTaskTitle.trim() ? catColor : colors.cardBorder }]}>
                  <Ionicons name="arrow-up" size={16} color="#FFF" />
                </Pressable>
              </View>

              {/* Tasks & Sub-tasks List */}
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                TASKS & CHECKLIST STEPS ({displayedTasks.length})
              </Text>

              {displayedTasks.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Ionicons name="folder-open-outline" size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No tasks in {currentFolderName}
                  </Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Create a task above or ask our AI Study Bot to generate a revision plan!
                  </Text>
                  <Pressable
                    onPress={() => {
                      setActiveTab('ai');
                      handleSendMessage(`Generate a study plan for ${category.name} - ${currentFolderName}`);
                    }}
                    style={[styles.aiGenerateBtn, { backgroundColor: catColor }]}>
                    <Ionicons name="sparkles" size={15} color="#FFF" />
                    <Text style={styles.aiGenerateBtnText}>Generate with AI Bot</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {displayedTasks.map((t) => {
                    const subs = t.subtasks || [];
                    const doneSubs = subs.filter((s) => s.completed).length;
                    const subPercent = subs.length > 0 ? Math.round((doneSubs / subs.length) * 100) : (t.completed ? 100 : 0);
                    const subInput = newSubTaskInputs[t.id] || '';

                    return (
                      <View
                        key={t.id}
                        style={[
                          styles.taskCard,
                          { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                        ]}>
                        {/* Task Card Header */}
                        <View style={styles.taskCardHeader}>
                          <Pressable
                            onPress={() => toggleTask(t.id)}
                            style={styles.taskTitleRow}>
                            <View
                              style={[
                                styles.taskCheckbox,
                                t.completed && [styles.taskCheckboxChecked, { backgroundColor: catColor, borderColor: catColor }],
                              ]}>
                              {t.completed && <Ionicons name="checkmark" size={13} color="#FFF" />}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.taskTitle,
                                  { color: colors.text },
                                  t.completed && styles.taskTitleCompleted,
                                ]}>
                                {t.title}
                              </Text>
                              <Text style={[styles.taskMeta, { color: colors.textSecondary }]}>
                                {subs.length} sub-tasks • {subPercent}% completed
                              </Text>
                            </View>
                          </Pressable>

                          <Pressable
                            onPress={() => deleteTask(t.id)}
                            hitSlop={8}
                            style={styles.deleteTaskBtn}>
                            <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                          </Pressable>
                        </View>

                        {/* Sub-tasks checklist */}
                        {subs.length > 0 && (
                          <View style={styles.subsListContainer}>
                            {subs.map((st) => (
                              <View key={st.id} style={styles.subItemRow}>
                                <Pressable
                                  onPress={() => toggleTaskSubItem(t.id, st.id)}
                                  style={styles.subItemLeft}>
                                  <View
                                    style={[
                                      styles.subCheckbox,
                                      st.completed && [styles.subCheckboxChecked, { backgroundColor: catColor, borderColor: catColor }],
                                    ]}>
                                    {st.completed && <Ionicons name="checkmark" size={11} color="#FFF" />}
                                  </View>
                                  <Text
                                    style={[
                                      styles.subItemText,
                                      { color: colors.text },
                                      st.completed && styles.subItemTextDone,
                                    ]}>
                                    {st.title}
                                  </Text>
                                </Pressable>

                                <Pressable
                                  onPress={() => deleteTaskSubItem(t.id, st.id)}
                                  hitSlop={6}
                                  style={styles.subItemDelete}>
                                  <Ionicons name="close" size={13} color={colors.textSecondary} />
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Add Step to this Task */}
                        <View style={[styles.addStepRow, { borderColor: colors.cardBorder }]}>
                          <TextInput
                            style={[styles.addStepInput, { color: colors.text }]}
                            placeholder="Add sub-task step..."
                            placeholderTextColor={colors.textSecondary}
                            value={subInput}
                            onChangeText={(val) =>
                              setNewSubTaskInputs((prev) => ({ ...prev, [t.id]: val }))
                            }
                            onSubmitEditing={() => handleAddSubTaskToTask(t.id)}
                          />
                          <Pressable
                            onPress={() => handleAddSubTaskToTask(t.id)}
                            disabled={!subInput.trim()}
                            style={[
                              styles.addStepBtn,
                              { backgroundColor: subInput.trim() ? catColor : colors.cardBorder },
                            ]}>
                            <Ionicons name="add" size={14} color="#FFF" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          ) : (
            /* AI STUDY BOT CHAT TAB */
            <View style={styles.chatContainer}>
              <ScrollView
                ref={chatScrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chatScroll}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubbleWrap,
                      msg.sender === 'user' ? styles.chatBubbleRight : styles.chatBubbleLeft,
                    ]}>
                    {msg.sender === 'bot' && (
                      <View style={[styles.botAvatar, { backgroundColor: catColor }]}>
                        <Ionicons name="sparkles" size={13} color="#FFF" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.chatBubble,
                        msg.sender === 'user'
                          ? [styles.userBubble, { backgroundColor: catColor }]
                          : [
                              styles.botBubble,
                              { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                            ],
                      ]}>
                      <Text
                        style={[
                          styles.chatBubbleText,
                          { color: msg.sender === 'user' ? '#FFF' : colors.text },
                        ]}>
                        {msg.text}
                      </Text>

                      {/* Suggested Steps Action */}
                      {msg.suggestedSubtasks && msg.suggestedSubtasks.length > 0 && (
                        <View style={styles.suggestedWrap}>
                          <Text style={[styles.suggestedHeading, { color: colors.textSecondary }]}>
                            SUGGESTED ROADMAP:
                          </Text>
                          {msg.suggestedSubtasks.map((step, idx) => (
                            <View key={idx} style={styles.suggestedItemRow}>
                              <Ionicons name="checkmark-circle-outline" size={13} color={catColor} />
                              <Text style={[styles.suggestedItemText, { color: colors.text }]}>
                                {step}
                              </Text>
                            </View>
                          ))}
                          <Pressable
                            onPress={() => handleApplyAISteps(msg.suggestedSubtasks || [])}
                            style={[styles.applyStepsBtn, { backgroundColor: catColor }]}>
                            <Ionicons name="add-circle" size={15} color="#FFF" />
                            <Text style={styles.applyStepsBtnText}>
                              Add as New Task with Sub-tasks
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      <Text
                        style={[
                          styles.chatTimestamp,
                          { color: msg.sender === 'user' ? '#E0E7FF' : colors.textSecondary },
                        ]}>
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                ))}

                {isBotThinking && (
                  <View style={[styles.chatBubbleWrap, styles.chatBubbleLeft]}>
                    <View style={[styles.botAvatar, { backgroundColor: catColor }]}>
                      <Ionicons name="sparkles" size={13} color="#FFF" />
                    </View>
                    <View
                      style={[
                        styles.chatBubble,
                        styles.botBubble,
                        { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                      ]}>
                      <Text style={[styles.chatBubbleText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                        Zen AI is preparing study guidance...
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Quick Prompts Bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickPromptsBar}
                contentContainerStyle={styles.quickPromptsContent}>
                <Pressable
                  onPress={() => handleSendMessage(`Break down tasks for ${category.name}`)}
                  style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.promptText, { color: colors.text }]}>⚡ Break into steps</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSendMessage(`Best revision tips for ${currentFolderName}`)}
                  style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.promptText, { color: colors.text }]}>🎯 Exam revision plan</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSendMessage('Suggest daily 45m study routine')}
                  style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.promptText, { color: colors.text }]}>⏱️ Study routine</Text>
                </Pressable>
              </ScrollView>

              {/* Chat Input */}
              <View style={[styles.chatInputBar, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <TextInput
                  style={[styles.chatTextInput, { color: colors.text }]}
                  placeholder={`Ask AI about ${category.name}...`}
                  placeholderTextColor={colors.textSecondary}
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={() => handleSendMessage()}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={() => handleSendMessage()}
                  disabled={!chatInput.trim()}
                  style={[styles.chatSendBtn, { backgroundColor: chatInput.trim() ? catColor : colors.cardBorder }]}>
                  <Ionicons name="paper-plane" size={16} color="#FFF" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  categorySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  progressBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBannerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressBannerPercent: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  foldersBar: {
    maxHeight: 46,
    marginBottom: 16,
  },
  foldersBarContent: {
    gap: 8,
    alignItems: 'center',
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  folderChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addFolderBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  newFolderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  newFolderInput: {
    fontSize: 12,
    paddingVertical: 2,
    minWidth: 90,
  },
  miniCheckBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCloseBtn: {
    padding: 2,
  },
  addTaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 18,
  },
  addTaskInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  addTaskSubmitBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxChecked: {
    borderColor: 'transparent',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskMeta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  deleteTaskBtn: {
    padding: 6,
  },
  subsListContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 6,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subCheckbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckboxChecked: {
    borderColor: 'transparent',
  },
  subItemText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  subItemTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subItemDelete: {
    padding: 4,
  },
  addStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  addStepInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
  },
  addStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  aiGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
  },
  aiGenerateBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  /* CHAT STYLES */
  chatContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatScroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  chatBubbleWrap: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 2,
  },
  chatBubbleLeft: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  chatBubbleRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  chatBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  chatTimestamp: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  suggestedWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  suggestedHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  suggestedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  suggestedItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyStepsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  applyStepsBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickPromptsBar: {
    maxHeight: 40,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  quickPromptsContent: {
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  chatSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/context/StudyContext';
import { StudyTask } from '@/types/study';
import { generateBotResponse, ChatMessage } from '@/services/aiStudyBot';

interface Props {
  visible: boolean;
  onClose: () => void;
  task: StudyTask | null;
  folderCategoryName?: string;
  folderSubcategoryName?: string;
}

export const ModalTaskFolder: React.FC<Props> = ({
  visible,
  onClose,
  task,
  folderCategoryName,
  folderSubcategoryName,
}) => {
  const {
    colors,
    categories,
    toggleTaskSubItem,
    addTaskSubItem,
    deleteTaskSubItem,
    addGeneratedSubtasks,
    toggleTask,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'folder' | 'ai'>('folder');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Determine category & subcategory info
  const taskCategory = categories.find((c) => c.id === task?.categoryId);
  const taskSubcategory = taskCategory?.subcategories.find((s) => s.id === task?.subcategoryId);

  const catName = folderCategoryName || taskCategory?.name || 'University Works';
  const subName = folderSubcategoryName || taskSubcategory?.name || 'Assignments';
  const themeColor = taskCategory?.color || '#6366F1';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: `👋 Hi! I'm your AI Study Companion for **"${task?.title || 'Study Goal'}"**.\n\n📁 **Category**: ${catName} • ${subName}\n\nAsk me anything! I can break this down into achievable subtasks, explain complex theories, or suggest revision plans.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedSubtasks: [
        `Break ${task?.title || 'this'} into study steps`,
        `Key revision tips for ${subName}`,
      ],
    },
  ]);

  if (!task) return null;

  const subtasks = task.subtasks || [];
  const completedSubs = subtasks.filter((s) => s.completed).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedSubs / subtasks.length) * 100)
      : task.completed
      ? 100
      : task.progressPercent || 0;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    addTaskSubItem(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
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
        taskTitle: task.title,
        categoryName: catName,
        subcategoryName: subName,
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
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 600);
  };

  const handleApplyAISubtasks = (steps: string[]) => {
    if (!steps || steps.length === 0) return;
    const items = steps.map((s) => ({ title: s }));
    addGeneratedSubtasks(task.id, items);
    setActiveTab('folder');
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
              <View style={[styles.folderIconBox, { backgroundColor: themeColor + '1E' }]}>
                <Ionicons name="folder-open" size={20} color={themeColor} />
              </View>
              <View style={styles.headerTitleWrap}>
                <View style={styles.folderBadgeRow}>
                  <Text style={[styles.folderBadgeText, { color: themeColor }]}>
                    {catName}
                  </Text>
                  <Text style={[styles.folderBadgeSeparator, { color: colors.textSecondary }]}>
                    ›
                  </Text>
                  <Text style={[styles.folderSubBadgeText, { color: colors.text }]}>
                    {subName}
                  </Text>
                </View>
                <Text style={[styles.taskHeaderTitle, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Tab Switcher: Folder Tasks vs AI Assistant */}
          <View style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}>
            <Pressable
              onPress={() => setActiveTab('folder')}
              style={[
                styles.tabBtn,
                activeTab === 'folder' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.card },
                ],
              ]}>
              <Ionicons
                name="list"
                size={16}
                color={activeTab === 'folder' ? themeColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'folder' ? colors.text : colors.textSecondary },
                  activeTab === 'folder' && { fontWeight: '700' },
                ]}>
                Sub-tasks Folder ({subtasks.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('ai')}
              style={[
                styles.tabBtn,
                activeTab === 'ai' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.card },
                ],
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

          {/* TAB CONTENT */}
          {activeTab === 'folder' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}>
              {/* Progress Summary Card */}
              <View
                style={[
                  styles.progressCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.progressCardTop}>
                  <Text style={[styles.progressCardLabel, { color: colors.textSecondary }]}>
                    FOLDER COMPLETION
                  </Text>
                  <Text style={[styles.progressCardPercent, { color: themeColor }]}>
                    {progressPercent}%
                  </Text>
                </View>

                {/* Progress Bar Track */}
                <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercent}%`, backgroundColor: themeColor },
                    ]}
                  />
                </View>

                <View style={styles.progressMetaRow}>
                  <Text style={[styles.progressMetaText, { color: colors.textSecondary }]}>
                    {completedSubs} of {subtasks.length} sub-tasks completed
                  </Text>
                  <Pressable
                    onPress={() => toggleTask(task.id)}
                    style={[
                      styles.markTaskCompleteBtn,
                      task.completed && { backgroundColor: '#10B981' },
                    ]}>
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={15}
                      color={task.completed ? '#FFF' : themeColor}
                    />
                    <Text
                      style={[
                        styles.markTaskCompleteText,
                        { color: task.completed ? '#FFF' : themeColor },
                      ]}>
                      {task.completed ? 'Completed' : 'Mark Task Done'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Sub-tasks Section */}
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Checklist & Steps
                </Text>
                <Pressable
                  onPress={() => setActiveTab('ai')}
                  style={styles.aiBreakdownTrigger}>
                  <Ionicons name="sparkles" size={13} color="#8B5CF6" />
                  <Text style={styles.aiBreakdownTriggerText}>AI Breakdown</Text>
                </Pressable>
              </View>

              {/* Subtask items list */}
              {subtasks.length === 0 ? (
                <View
                  style={[
                    styles.emptySubsBox,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  <Ionicons name="layers-outline" size={28} color={colors.textSecondary} />
                  <Text style={[styles.emptySubsTitle, { color: colors.text }]}>
                    No sub-tasks in this folder yet
                  </Text>
                  <Text style={[styles.emptySubsDesc, { color: colors.textSecondary }]}>
                    Break down this task into smaller steps below, or ask our AI Study Bot to generate them for you!
                  </Text>
                  <Pressable
                    onPress={() => {
                      setActiveTab('ai');
                      handleSendMessage(`Please break down ${task.title} into steps`);
                    }}
                    style={styles.askAiEmptyBtn}>
                    <Ionicons name="sparkles" size={15} color="#FFF" />
                    <Text style={styles.askAiEmptyBtnText}>Generate with AI Bot</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.subtasksList}>
                  {subtasks.map((st) => (
                    <View
                      key={st.id}
                      style={[
                        styles.subtaskItem,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: colors.cardBorder,
                        },
                      ]}>
                      <Pressable
                        onPress={() => toggleTaskSubItem(task.id, st.id)}
                        style={styles.subtaskCheckRow}>
                        <View
                          style={[
                            styles.checkbox,
                            st.completed && [styles.checkboxChecked, { backgroundColor: themeColor, borderColor: themeColor }],
                          ]}>
                          {st.completed && (
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.subtaskText,
                            { color: colors.text },
                            st.completed && styles.subtaskTextDone,
                          ]}>
                          {st.title}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => deleteTaskSubItem(task.id, st.id)}
                        hitSlop={8}
                        style={styles.subtaskDeleteBtn}>
                        <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Add New Subtask Input */}
              <View
                style={[
                  styles.addSubtaskRow,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <Ionicons name="add-circle-outline" size={20} color={themeColor} />
                <TextInput
                  style={[styles.addSubtaskInput, { color: colors.text }]}
                  placeholder="Add a new step or sub-task..."
                  placeholderTextColor={colors.textSecondary}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  style={[
                    styles.addSubtaskSubmitBtn,
                    { backgroundColor: newSubtaskTitle.trim() ? themeColor : colors.cardBorder },
                  ]}>
                  <Ionicons name="arrow-up" size={16} color="#FFF" />
                </Pressable>
              </View>

              {/* AI Study Bot Banner */}
              <Pressable
                onPress={() => setActiveTab('ai')}
                style={styles.aiBannerCard}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.aiBannerGradient}>
                  <View style={styles.aiBannerLeft}>
                    <View style={styles.aiBannerIconCircle}>
                      <Ionicons name="chatbubbles" size={20} color="#FFF" />
                    </View>
                    <View style={styles.aiBannerTextWrap}>
                      <Text style={styles.aiBannerTitle}>Need Study Guidance?</Text>
                      <Text style={styles.aiBannerSubtitle}>
                        Chat with AI Study Bot for theory explanations, formulas & tips
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </ScrollView>
          ) : (
            /* AI STUDY BOT CHAT TAB */
            <View style={styles.chatContainer}>
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chatScroll}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubbleWrap,
                      msg.sender === 'user' ? styles.chatBubbleRight : styles.chatBubbleLeft,
                    ]}>
                    {msg.sender === 'bot' && (
                      <View style={styles.botAvatar}>
                        <Ionicons name="sparkles" size={13} color="#FFF" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.chatBubble,
                        msg.sender === 'user'
                          ? [styles.userBubble, { backgroundColor: themeColor }]
                          : [
                              styles.botBubble,
                              {
                                backgroundColor: colors.backgroundElement,
                                borderColor: colors.cardBorder,
                              },
                            ],
                      ]}>
                      <Text
                        style={[
                          styles.chatBubbleText,
                          { color: msg.sender === 'user' ? '#FFF' : colors.text },
                        ]}>
                        {msg.text}
                      </Text>

                      {/* If the bot suggested subtasks, offer an insert button */}
                      {msg.suggestedSubtasks && msg.suggestedSubtasks.length > 0 && (
                        <View style={styles.suggestedSubtasksWrap}>
                          <Text style={[styles.suggestedSubtasksHeading, { color: colors.textSecondary }]}>
                            SUGGESTED STEPS:
                          </Text>
                          {msg.suggestedSubtasks.map((step, idx) => (
                            <View key={idx} style={styles.suggestedStepItem}>
                              <Ionicons name="checkmark-circle-outline" size={13} color={themeColor} />
                              <Text style={[styles.suggestedStepText, { color: colors.text }]}>
                                {step}
                              </Text>
                            </View>
                          ))}
                          <Pressable
                            onPress={() => handleApplyAISubtasks(msg.suggestedSubtasks || [])}
                            style={[styles.addStepsToTaskBtn, { backgroundColor: themeColor }]}>
                            <Ionicons name="add" size={15} color="#FFF" />
                            <Text style={styles.addStepsToTaskBtnText}>
                              Add These Steps to Task Folder
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
                    <View style={styles.botAvatar}>
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

              {/* Quick Prompt Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickPromptsBar}
                contentContainerStyle={styles.quickPromptsContent}>
                <Pressable
                  onPress={() => handleSendMessage(`Break down ${task.title} into steps`)}
                  style={[styles.quickPromptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>
                    ⚡ Break into steps
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSendMessage(`Best revision tips for ${subName}`)}
                  style={[styles.quickPromptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>
                    🎯 Revision strategy
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSendMessage('Suggest a 25m Pomodoro plan for this')}
                  style={[styles.quickPromptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>
                    ⏱️ Pomodoro plan
                  </Text>
                </Pressable>
              </ScrollView>

              {/* Chat Input Bar */}
              <View
                style={[
                  styles.chatInputBar,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <TextInput
                  style={[styles.chatTextInput, { color: colors.text }]}
                  placeholder="Ask AI bot about this task..."
                  placeholderTextColor={colors.textSecondary}
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={() => handleSendMessage()}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={() => handleSendMessage()}
                  disabled={!chatInput.trim()}
                  style={[
                    styles.chatSendBtn,
                    { backgroundColor: chatInput.trim() ? themeColor : colors.cardBorder },
                  ]}>
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    maxHeight: '88%',
    minHeight: '65%',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  folderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  folderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  folderBadgeSeparator: {
    fontSize: 12,
    fontWeight: '600',
  },
  folderSubBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
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
  progressCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressCardPercent: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  markTaskCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  markTaskCompleteText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  aiBreakdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#8B5CF618',
  },
  aiBreakdownTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  emptySubsBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptySubsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubsDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  askAiEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  askAiEmptyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtasksList: {
    gap: 8,
    marginBottom: 14,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  subtaskCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: 'transparent',
  },
  subtaskText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  subtaskTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subtaskDeleteBtn: {
    padding: 4,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  addSubtaskInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  addSubtaskSubmitBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiBannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTextWrap: {
    flex: 1,
  },
  aiBannerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  aiBannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
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
    backgroundColor: '#8B5CF6',
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
  suggestedSubtasksWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  suggestedSubtasksHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  suggestedStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  suggestedStepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addStepsToTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  addStepsToTaskBtnText: {
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
  quickPromptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickPromptText: {
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

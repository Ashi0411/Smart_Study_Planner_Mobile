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
import { generateBotResponse, ChatMessage } from '@/services/aiStudyBot';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalAIChat: React.FC<Props> = ({ visible, onClose }) => {
  const { colors, categories, addTask } = useStudy();

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-global',
      sender: 'bot',
      text: `👋 Hello! I am **Zen AI**, your intelligent University Study Assistant.\n\nI can help you:\n• Break down semester assignments into small sub-tasks 📚\n• Build exam revision strategies 🎯\n• IELTS speaking & essay writing practice 🌍\n• Organize your daily study schedule ⏱️\n\nWhat would you like help with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedSubtasks: [
        'Organize Semester Exam Revision',
        'Break down University Assignments',
        'IELTS Speaking Fluency Practice',
      ],
    },
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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
        taskTitle: 'University & English Goals',
        categoryName: 'University Works',
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

  const handleAddAsNewTask = (taskTitle: string) => {
    const uniCat = categories.find((c) => c.id === 'cat-uni-works') || categories[0];
    const sub = uniCat?.subcategories[0]?.id;
    addTask({
      title: taskTitle,
      categoryId: uniCat.id,
      subcategoryId: sub,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      estimatedMinutes: 60,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}>
            <View style={styles.headerLeft}>
              <View style={styles.botIconCircle}>
                <Ionicons name="sparkles" size={20} color="#FFF" />
              </View>
              <View>
                <View style={styles.botTitleRow}>
                  <Text style={styles.botTitle}>Zen AI Study Bot</Text>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
                <Text style={styles.botSubtitle}>University & Language Companion</Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </LinearGradient>

          {/* Chat Messages */}
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
                  <View style={styles.botBubbleAvatar}>
                    <Ionicons name="school" size={12} color="#FFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.chatBubble,
                    msg.sender === 'user'
                      ? styles.userBubble
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

                  {/* Suggested Subtasks / Actions */}
                  {msg.suggestedSubtasks && msg.suggestedSubtasks.length > 0 && (
                    <View style={styles.actionWrap}>
                      <Text style={[styles.actionHeading, { color: colors.textSecondary }]}>
                        ACTIONS & TASKS:
                      </Text>
                      {msg.suggestedSubtasks.map((taskItem, idx) => (
                        <View key={idx} style={styles.actionItemRow}>
                          <Text style={[styles.actionItemText, { color: colors.text }]} numberOfLines={1}>
                            • {taskItem}
                          </Text>
                          <Pressable
                            onPress={() => handleAddAsNewTask(taskItem)}
                            style={styles.addMiniBtn}>
                            <Ionicons name="add" size={13} color="#6366F1" />
                            <Text style={styles.addMiniBtnText}>Add</Text>
                          </Pressable>
                        </View>
                      ))}
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
                <View style={styles.botBubbleAvatar}>
                  <Ionicons name="sparkles" size={12} color="#FFF" />
                </View>
                <View
                  style={[
                    styles.chatBubble,
                    styles.botBubble,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                  ]}>
                  <Text style={[styles.chatBubbleText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                    Zen AI is analyzing your study goals...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggested Prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promptsBar}
            contentContainerStyle={styles.promptsContent}>
            <Pressable
              onPress={() => handleSendMessage('Break down my semester assignment')}
              style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Text style={[styles.promptText, { color: colors.text }]}>📚 Break down assignment</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSendMessage('How to prepare for exam in 3 days?')}
              style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Text style={[styles.promptText, { color: colors.text }]}>🎯 Exam revision plan</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSendMessage('IELTS speaking part 2 tips')}
              style={[styles.promptChip, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Text style={[styles.promptText, { color: colors.text }]}>🗣️ IELTS practice</Text>
            </Pressable>
          </ScrollView>

          {/* Chat Input Bar */}
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
              },
            ]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ask anything about university or studies..."
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
                styles.sendBtn,
                { backgroundColor: chatInput.trim() ? '#6366F1' : colors.cardBorder },
              ]}>
              <Ionicons name="paper-plane" size={16} color="#FFF" />
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    height: '85%',
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  botTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
  },
  onlineText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '600',
  },
  botSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  chatScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  botBubbleAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6366F1',
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
    backgroundColor: '#6366F1',
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
  actionWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  actionItemText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  promptsBar: {
    maxHeight: 40,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  promptsContent: {
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

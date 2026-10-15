import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useStudy } from '@/context/StudyContext';
import { Category, LectureNote, QuizQuestion } from '@/types/study';
import { generateNoteSummary, generateQuizFromNote } from '@/services/aiNoteSummarizer';

interface Props {
  visible: boolean;
  onClose: () => void;
  category: Category | null;
}

type ActiveTab = 'notes' | 'quiz' | 'records';
type SummaryLang = 'english' | 'sinhala';

export const ModalLectureNotesHub: React.FC<Props> = ({
  visible,
  onClose,
  category,
}) => {
  const {
    colors,
    lectureNotes,
    quizRecords,
    addLectureNote,
    deleteLectureNote,
    saveQuizRecord,
    deleteQuizRecord,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [selectedNote, setSelectedNote] = useState<LectureNote | null>(null);
  const [summaryLang, setSummaryLang] = useState<SummaryLang>('english');

  // New Note Upload / Paste modal state
  const [isUploading, setIsUploading] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [pickedFileSize, setPickedFileSize] = useState<number | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Active Quiz Playing State
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  if (!category) return null;

  const catColor = category.color || '#6366F1';
  const categoryNotes = lectureNotes.filter((n) => n.categoryId === category.id);
  const categoryQuizzes = quizRecords.filter((q) => q.categoryId === category.id);

  // Handle Document Pick
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setPickedFileName(file.name);
        if (file.size) setPickedFileSize(file.size);
        if (!newNoteTitle.trim()) {
          setNewNoteTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        // If content is empty, provide note context placeholder
        if (!newNoteContent.trim()) {
          setNewNoteContent(
            `Lecture notes extracted from file: ${file.name}\n\nKey discussion areas:\n- Core architectural definitions\n- Theoretical derivations & calculation methodologies\n- Practical lab applications and exam review points.`
          );
        }
      }
    } catch {
      Alert.alert('Notice', 'File selection was cancelled.');
    }
  };

  // Create Note & Generate AI Summaries
  const handleSaveNote = () => {
    if (!newNoteTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for the lecture note.');
      return;
    }
    if (!newNoteContent.trim()) {
      Alert.alert('Required', 'Please paste or write your lecture notes content.');
      return;
    }

    setIsProcessingAI(true);
    setTimeout(() => {
      const { summaryEnglish, summarySinhala, keyPoints } = generateNoteSummary(
        newNoteTitle,
        newNoteContent,
        category.name
      );

      const created = addLectureNote({
        title: newNoteTitle.trim(),
        categoryId: category.id,
        originalContent: newNoteContent.trim(),
        fileName: pickedFileName || undefined,
        fileSize: pickedFileSize || undefined,
        summaryEnglish,
        summarySinhala,
        keyPoints,
      });

      setIsProcessingAI(false);
      setIsUploading(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      setPickedFileName(null);
      setPickedFileSize(null);
      setSelectedNote(created);
    }, 400);
  };

  // Start Quiz from Note
  const handleStartQuizFromNote = (note: LectureNote) => {
    const questions = generateQuizFromNote(
      note.title,
      note.originalContent,
      note.summaryEnglish,
      5
    );
    setActiveQuizQuestions(questions);
    setActiveQuizTitle(note.title + ' Quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveTab('quiz');
  };

  // Quick Start Default Quiz for Category
  const handleStartCategoryQuiz = () => {
    const questions = generateQuizFromNote(
      category.name,
      category.name + ' practice review',
      '',
      5
    );
    setActiveQuizQuestions(questions);
    setActiveQuizTitle(`${category.name} Mastery Quiz`);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveTab('quiz');
  };

  // Handle Answer Select
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    activeQuizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    const percentage = Math.round((score / activeQuizQuestions.length) * 100);
    saveQuizRecord({
      noteId: selectedNote?.id,
      title: activeQuizTitle || `${category.name} Quiz`,
      categoryId: category.id,
      totalQuestions: activeQuizQuestions.length,
      score,
      percentage,
      questions: activeQuizQuestions,
      userAnswers: selectedAnswers,
    });
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
              <View style={[styles.catIconWrap, { backgroundColor: catColor + '1E' }]}>
                <Ionicons name="school" size={20} color={catColor} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {category.name} Notes & Quizzes
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Upload Notes • AI Short Notes (සිංහල / English) • Quizzes
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Navigation Sub-Tabs */}
          <View style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}>
            <Pressable
              onPress={() => setActiveTab('notes')}
              style={[styles.tabBtn, activeTab === 'notes' && [styles.tabBtnActive, { backgroundColor: colors.card }]]}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={activeTab === 'notes' ? catColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'notes' ? colors.text : colors.textSecondary },
                  activeTab === 'notes' && { fontWeight: '700' },
                ]}>
                Notes ({categoryNotes.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (activeQuizQuestions.length === 0) {
                  handleStartCategoryQuiz();
                } else {
                  setActiveTab('quiz');
                }
              }}
              style={[styles.tabBtn, activeTab === 'quiz' && [styles.tabBtnActive, { backgroundColor: colors.card }]]}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={activeTab === 'quiz' ? catColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'quiz' ? colors.text : colors.textSecondary },
                  activeTab === 'quiz' && { fontWeight: '700' },
                ]}>
                Take Quiz
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('records')}
              style={[styles.tabBtn, activeTab === 'records' && [styles.tabBtnActive, { backgroundColor: colors.card }]]}>
              <Ionicons
                name="ribbon-outline"
                size={16}
                color={activeTab === 'records' ? catColor : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'records' ? colors.text : colors.textSecondary },
                  activeTab === 'records' && { fontWeight: '700' },
                ]}>
                Records ({categoryQuizzes.length})
              </Text>
            </Pressable>
          </View>

          {/* TAB 1: LECTURE NOTES & SUMMARIES */}
          {activeTab === 'notes' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Action Upload Trigger */}
              {!isUploading ? (
                <View style={styles.uploadPromptRow}>
                  <Pressable
                    onPress={() => setIsUploading(true)}
                    style={[styles.uploadActionCard, { backgroundColor: catColor + '12', borderColor: catColor + '40' }]}>
                    <View style={[styles.uploadIconCircle, { backgroundColor: catColor }]}>
                      <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.uploadPromptTitle, { color: colors.text }]}>
                        Upload Lecture Note / PDF
                      </Text>
                      <Text style={[styles.uploadPromptDesc, { color: colors.textSecondary }]}>
                        Auto-summarizes into English & Sinhala short notes + generates revision quizzes
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={24} color={catColor} />
                  </Pressable>
                </View>
              ) : (
                /* Note Upload / Input Form */
                <View style={[styles.uploadFormCard, { backgroundColor: colors.backgroundElement, borderColor: catColor }]}>
                  <View style={styles.formHeader}>
                    <Text style={[styles.formTitle, { color: colors.text }]}>Add New Lecture Note</Text>
                    <Pressable onPress={() => setIsUploading(false)}>
                      <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </Pressable>
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NOTE TITLE / MODULE</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
                    placeholder="e.g. Software Architecture - Lecture 03"
                    placeholderTextColor={colors.textSecondary}
                    value={newNoteTitle}
                    onChangeText={setNewNoteTitle}
                  />

                  {/* Pick Document Button */}
                  <Pressable
                    onPress={handlePickDocument}
                    style={[styles.pickDocBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Ionicons name="attach" size={18} color={catColor} />
                    <Text style={[styles.pickDocText, { color: colors.text }]}>
                      {pickedFileName ? `Selected: ${pickedFileName}` : 'Pick Note File (PDF, TXT, DOCX)'}
                    </Text>
                    {pickedFileName && (
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    )}
                  </Pressable>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>LECTURE NOTE CONTENT / TRANSCRIPT</Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder },
                    ]}
                    placeholder="Paste your lecture notes, slides text, or discussion summary here..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={6}
                    value={newNoteContent}
                    onChangeText={setNewNoteContent}
                  />

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSaveNote}
                    disabled={isProcessingAI}
                    style={[styles.generateSummaryBtn, { backgroundColor: catColor }]}>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.generateSummaryBtnText}>
                      {isProcessingAI ? 'AI Summarizing...' : 'Summarize & Generate Notes'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Selected Note Reader & Bilingual Summarizer */}
              {selectedNote && (
                <View style={[styles.noteDetailCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <View style={styles.detailHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedNote.title}</Text>
                      <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                        {new Date(selectedNote.createdAt).toLocaleDateString()} • {selectedNote.fileName || 'Manual Note'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteLectureNote(selectedNote.id)}
                      hitSlop={8}
                      style={styles.deleteNoteBtn}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>

                  {/* Language Toggle: English vs Sinhala (සිංහල) */}
                  <View style={[styles.langToggleWrap, { backgroundColor: colors.card }]}>
                    <Pressable
                      onPress={() => setSummaryLang('english')}
                      style={[
                        styles.langBtn,
                        summaryLang === 'english' && [styles.langBtnActive, { backgroundColor: catColor }],
                      ]}>
                      <Text
                        style={[
                          styles.langBtnText,
                          { color: summaryLang === 'english' ? '#FFF' : colors.textSecondary },
                        ]}>
                        🇬🇧 English Short Note
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setSummaryLang('sinhala')}
                      style={[
                        styles.langBtn,
                        summaryLang === 'sinhala' && [styles.langBtnActive, { backgroundColor: catColor }],
                      ]}>
                      <Text
                        style={[
                          styles.langBtnText,
                          { color: summaryLang === 'sinhala' ? '#FFF' : colors.textSecondary },
                        ]}>
                        🇱🇰 සිංහල කෙටි සටහන
                      </Text>
                    </Pressable>
                  </View>

                  {/* Summary Text Content */}
                  <View style={[styles.summaryTextBox, { backgroundColor: colors.card }]}>
                    <Text style={[styles.summaryText, { color: colors.text }]}>
                      {summaryLang === 'english'
                        ? selectedNote.summaryEnglish
                        : selectedNote.summarySinhala}
                    </Text>
                  </View>

                  {/* Key Takeaways */}
                  <Text style={[styles.keyPointsTitle, { color: colors.textSecondary }]}>
                    KEY TAKEAWAYS:
                  </Text>
                  {selectedNote.keyPoints.map((pt, idx) => (
                    <View key={idx} style={styles.keyPointRow}>
                      <Ionicons name="checkmark-circle" size={14} color={catColor} />
                      <Text style={[styles.keyPointText, { color: colors.text }]}>{pt}</Text>
                    </View>
                  ))}

                  {/* Generate Quiz from this note button */}
                  <Pressable
                    onPress={() => handleStartQuizFromNote(selectedNote)}
                    style={[styles.quizFromNoteBtn, { backgroundColor: catColor }]}>
                    <Ionicons name="flash" size={16} color="#FFF" />
                    <Text style={styles.quizFromNoteBtnText}>Generate Practice Quiz from this Note</Text>
                  </Pressable>
                </View>
              )}

              {/* Saved Notes List */}
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                UPLOADED LECTURE NOTES ({categoryNotes.length})
              </Text>

              {categoryNotes.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Ionicons name="document-text-outline" size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No lecture notes uploaded yet</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Tap Upload Lecture Note above to upload lecture slides or paste lecture summaries.
                  </Text>
                </View>
              ) : (
                categoryNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  return (
                    <Pressable
                      key={note.id}
                      onPress={() => setSelectedNote(note)}
                      style={[
                        styles.noteCardItem,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: isSelected ? catColor : colors.cardBorder,
                        },
                      ]}>
                      <View style={[styles.noteIconCircle, { backgroundColor: catColor + '18' }]}>
                        <Ionicons name="document-text" size={18} color={catColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.noteCardTitle, { color: colors.text }]}>{note.title}</Text>
                        <Text style={[styles.noteCardDate, { color: colors.textSecondary }]}>
                          {new Date(note.createdAt).toLocaleDateString()} • {note.keyPoints.length} core points
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* TAB 2: INTERACTIVE AI QUIZ */}
          {activeTab === 'quiz' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={[styles.quizHeaderCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <View style={styles.quizTitleRow}>
                  <Ionicons name="help-circle" size={20} color={catColor} />
                  <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={1}>
                    {activeQuizTitle || `${category.name} Quiz`}
                  </Text>
                </View>
                {activeQuizQuestions.length > 0 && !quizSubmitted && (
                  <Text style={[styles.quizProgressText, { color: catColor }]}>
                    Question {currentQuestionIndex + 1} of {activeQuizQuestions.length}
                  </Text>
                )}
              </View>

              {activeQuizQuestions.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Ionicons name="school-outline" size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Quiz Loaded</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Generate a quiz from one of your lecture notes or start a fresh practice quiz!
                  </Text>
                  <Pressable
                    onPress={handleStartCategoryQuiz}
                    style={[styles.generateSummaryBtn, { backgroundColor: catColor, marginTop: 12 }]}>
                    <Ionicons name="flash" size={16} color="#FFF" />
                    <Text style={styles.generateSummaryBtnText}>Start Quick Practice Quiz</Text>
                  </Pressable>
                </View>
              ) : !quizSubmitted ? (
                /* Question View */
                <View style={[styles.questionCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.questionText, { color: colors.text }]}>
                    {activeQuizQuestions[currentQuestionIndex].question}
                  </Text>

                  {/* Options List */}
                  <View style={styles.optionsWrap}>
                    {activeQuizQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[activeQuizQuestions[currentQuestionIndex].id] === oIdx;
                      return (
                        <Pressable
                          key={oIdx}
                          onPress={() =>
                            handleSelectAnswer(activeQuizQuestions[currentQuestionIndex].id, oIdx)
                          }
                          style={[
                            styles.optionItem,
                            {
                              backgroundColor: isSelected ? catColor + '18' : colors.card,
                              borderColor: isSelected ? catColor : colors.cardBorder,
                            },
                          ]}>
                          <View
                            style={[
                              styles.optionRadio,
                              { borderColor: isSelected ? catColor : colors.cardBorder },
                              isSelected && { backgroundColor: catColor },
                            ]}>
                            {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                          </View>
                          <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Navigation Buttons */}
                  <View style={styles.quizNavRow}>
                    <Pressable
                      disabled={currentQuestionIndex === 0}
                      onPress={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
                      style={[styles.quizNavBtn, { opacity: currentQuestionIndex === 0 ? 0.4 : 1 }]}>
                      <Ionicons name="arrow-back" size={16} color={colors.text} />
                      <Text style={[styles.quizNavBtnText, { color: colors.text }]}>Previous</Text>
                    </Pressable>

                    {currentQuestionIndex < activeQuizQuestions.length - 1 ? (
                      <Pressable
                        onPress={() => setCurrentQuestionIndex((p) => p + 1)}
                        style={[styles.quizNavBtn, { backgroundColor: catColor }]}>
                        <Text style={[styles.quizNavBtnText, { color: '#FFF' }]}>Next Question</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={handleSubmitQuiz}
                        style={[styles.quizNavBtn, { backgroundColor: '#10B981' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                        <Text style={[styles.quizNavBtnText, { color: '#FFF' }]}>Submit Quiz</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : (
                /* Quiz Results & Answers Review */
                <View style={[styles.resultsCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{quizScore} / {activeQuizQuestions.length}</Text>
                    <Text style={styles.scoreLabel}>
                      {Math.round(((quizScore || 0) / activeQuizQuestions.length) * 100)}% SCORE
                    </Text>
                  </View>

                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {(quizScore || 0) >= activeQuizQuestions.length * 0.7
                      ? '🎉 Outstanding Performance!'
                      : '📖 Good Effort! Review Explanations Below:'}
                  </Text>

                  {/* Detailed Review */}
                  <View style={styles.reviewList}>
                    {activeQuizQuestions.map((q, qIndex) => {
                      const userChoice = selectedAnswers[q.id];
                      const isCorrect = userChoice === q.correctAnswerIndex;

                      return (
                        <View key={q.id} style={[styles.reviewItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                          <View style={styles.reviewHeader}>
                            <Ionicons
                              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                              size={18}
                              color={isCorrect ? '#10B981' : '#EF4444'}
                            />
                            <Text style={[styles.reviewQTitle, { color: colors.text }]}>
                              Q{qIndex + 1}: {q.question}
                            </Text>
                          </View>
                          <Text style={[styles.reviewCorrectAnswer, { color: '#10B981' }]}>
                            Correct: {q.options[q.correctAnswerIndex]}
                          </Text>
                          <Text style={[styles.reviewExplanation, { color: colors.textSecondary }]}>
                            💡 {q.explanation}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Pressable
                    onPress={handleStartCategoryQuiz}
                    style={[styles.retakeBtn, { backgroundColor: catColor }]}>
                    <Ionicons name="refresh" size={16} color="#FFF" />
                    <Text style={styles.retakeBtnText}>Take Another Quiz</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}

          {/* TAB 3: QUIZ RECORDS & HISTORY */}
          {activeTab === 'records' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                PAST QUIZ ATTEMPTS ({categoryQuizzes.length})
              </Text>

              {categoryQuizzes.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                  <Ionicons name="ribbon-outline" size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Quiz Records Yet</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Take your first revision quiz to start building your score records!
                  </Text>
                  <Pressable
                    onPress={handleStartCategoryQuiz}
                    style={[styles.generateSummaryBtn, { backgroundColor: catColor, marginTop: 12 }]}>
                    <Ionicons name="flash" size={16} color="#FFF" />
                    <Text style={styles.generateSummaryBtnText}>Take Practice Quiz Now</Text>
                  </Pressable>
                </View>
              ) : (
                categoryQuizzes.map((rec) => (
                  <View
                    key={rec.id}
                    style={[styles.recordCard, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                    <View style={styles.recordHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.recordTitle, { color: colors.text }]}>{rec.title}</Text>
                        <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                          {new Date(rec.completedAt).toLocaleString()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.recordScoreBadge,
                          {
                            backgroundColor: rec.percentage >= 70 ? '#10B9811A' : '#EF44441A',
                            borderColor: rec.percentage >= 70 ? '#10B981' : '#EF4444',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.recordScoreText,
                            { color: rec.percentage >= 70 ? '#10B981' : '#EF4444' },
                          ]}>
                          {rec.score}/{rec.totalQuestions} ({rec.percentage}%)
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => deleteQuizRecord(rec.id)}
                        hitSlop={8}
                        style={{ marginLeft: 8 }}>
                        <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
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
    height: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
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
    fontSize: 12,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  /* Upload card */
  uploadPromptRow: {
    marginVertical: 8,
  },
  uploadActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPromptTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  uploadPromptDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  /* Form */
  uploadFormCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 8,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  pickDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  pickDocText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  generateSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  generateSummaryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Note Detail Card */
  noteDetailCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteNoteBtn: {
    padding: 4,
  },
  langToggleWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryTextBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12.5,
    lineHeight: 19,
  },
  keyPointsTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  keyPointText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  quizFromNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 14,
  },
  quizFromNoteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  /* List items */
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  noteCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  noteIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  noteCardDate: {
    fontSize: 11,
    marginTop: 2,
  },
  /* Quiz styles */
  quizHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 8,
  },
  quizTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  quizProgressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 8,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsWrap: {
    gap: 10,
    marginBottom: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  quizNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quizNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quizNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  /* Results view */
  resultsCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreCircle: {
    backgroundColor: '#6366F1',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scoreNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  reviewList: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  reviewItem: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  reviewQTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  reviewCorrectAnswer: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  reviewExplanation: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  /* Records list */
  recordCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recordDate: {
    fontSize: 11,
    marginTop: 2,
  },
  recordScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  recordScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

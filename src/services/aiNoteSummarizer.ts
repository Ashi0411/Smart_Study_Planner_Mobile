import { QuizQuestion } from '@/types/study';

interface SummaryResult {
  summaryEnglish: string;
  summarySinhala: string;
  keyPoints: string[];
}

/**
 * Intelligent Summarizer for Lecture Notes (Bilingual English & Sinhala)
 */
export function generateNoteSummary(
  title: string,
  content: string,
  categoryName: string
): SummaryResult {
  const cleanTitle = title.trim() || 'Lecture Topic';
  const cleanContent = content.trim();
  const lowerContent = cleanContent.toLowerCase();
  const lowerTitle = cleanTitle.toLowerCase();
  const isEnglishSubject =
    categoryName.toLowerCase().includes('english') ||
    lowerTitle.includes('english') ||
    lowerTitle.includes('ielts') ||
    lowerTitle.includes('grammar') ||
    lowerTitle.includes('vocabulary') ||
    lowerContent.includes('ielts') ||
    lowerContent.includes('grammar');

  // Extract paragraphs
  const paragraphs = cleanContent
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15);

  // Identify key terms or bullet points from content
  const detectedKeywords: string[] = [];
  const words = cleanContent.match(/[A-Z][a-z]{3,}/g) || [];
  const uniqueWords = Array.from(new Set(words)).slice(0, 8);
  detectedKeywords.push(...uniqueWords);

  if (isEnglishSubject) {
    // English Language & IELTS Notes Summarization
    const engSummary = `### 📘 Comprehensive English Short Note: ${cleanTitle}

#### 1. Core Focus & Objectives
• Master key grammatical structures, band-boosting vocabulary, and sentence transitions.
• Avoid common repetition and elevate lexical resource.

#### 2. Essential Vocabulary & Expressions
${
  paragraphs.length > 0
    ? paragraphs.slice(0, 3).map((p) => `• **Key Concept**: ${p}`).join('\n')
    : `• **Advanced Collocations**: Crucial for coherent expression in writing and speaking.\n• **Cohesive Devices**: Linking words that organize paragraphs logically.`
}

#### 3. Sentence Variety & Grammar Rules
• **Complex Sentences**: Combine independent and subordinate clauses using connectors (*whereas, while, although, furthermore*).
• **Active vs. Passive Voice**: Use passive forms when reporting data or academic findings.

#### 4. Exam & Practical Application Tips
• Practice timed writing drills (Task 1: 20 min, Task 2: 40 min).
• Review for subject-verb agreement and article accuracy (*a, an, the*).`;

    const sinSummary = `### 📗 සිංහල කෙටි සටහන (Sinhala Summary): ${cleanTitle}

#### 1. මූලික අරමුණු සහ විෂය සාරාංශය
• මෙම පාඩම මඟින් ඉංග්‍රීසි භාෂාවේ ව්‍යාකරණ රටා, නව වචන මාලාව (Vocabulary) සහ චතුර ලෙස අදහස් ප්‍රකාශ කිරීමේ ක්‍රමවේද පිළිබඳව අවධානය යොමු කරයි.

#### 2. වැදගත් කරුණු සහ සාරාංශය
${
  paragraphs.length > 0
    ? paragraphs.slice(0, 2).map((p) => `• **ප්‍රධාන කරුණ**: ${p}`).join('\n')
    : `• විභාග සඳහා ලිවීමේදී (Writing) සහ කතා කිරීමේදී (Speaking) සංකීර්ණ වාක්‍ය රටා (Complex Sentences) නිවැරදිව භාවිතය.\n• විවිධ මාතෘකා යටතේ නිවැරදි වචන ගළපා අදහස් පැහැදිලි කිරීම.`
}

#### 3. විභාගය සඳහා විශේෂ උපදෙස් (Exam Tips)
• නිතර පුහුණු වීමෙන් වාක්‍ය වල ඇතිවන spelling සහ grammatical වැරදි අවම කරගත හැක.
• කෙටි කාලයක් තුළ ප්‍රශ්න වලට පිළිතුරු සපයන ආකාරය පුරුදු වන්න.`;

    const keyPoints = [
      `Master core terminology related to "${cleanTitle}"`,
      'Utilize complex and compound sentence structures with cohesive linkers',
      'Focus on lexical resource and accurate preposition usage',
      'Apply active recall and timed exercises for maximum retention',
    ];

    return { summaryEnglish: engSummary, summarySinhala: sinSummary, keyPoints };
  }

  // University / Technical / Academic Lecture Notes Summarization
  const engSummary = `### 🎓 University Lecture Short Note: ${cleanTitle}

#### 1. Executive Overview & Core Problem Statement
• **Topic Scope**: ${cleanTitle} represents a pivotal building block in understanding theoretical foundations and practical applications.
• **Significance**: Enables systematic problem solving, algorithmic efficiency, and scalable design.

#### 2. Key Theoretical Concepts
${
  paragraphs.length > 0
    ? paragraphs.slice(0, 4).map((p, idx) => `• **Point ${idx + 1}**: ${p}`).join('\n')
    : `• **Fundamental Principles**: Core definitions, architectural components, and constraints.\n• **Methodology**: Step-by-step procedures, data workflows, and transformation stages.\n• **Optimization**: Trade-offs between memory, time complexity, and maintenance.`
}

#### 3. Crucial Formulae / Architecture & Mechanism
• **Inputs & Preconditions**: Verify initial state and boundary parameters.
• **Processing Logic**: Execute core transformations adhering to modular boundaries.
• **Postconditions & Outputs**: Validate output consistency against reference benchmarks.

#### 4. High-Yield Exam Review & Common Pitfalls
• Be prepared for derivation / implementation questions from this module.
• Always justify design decisions and state any simplifying assumptions.`;

  const sinSummary = `### 🔬 විශ්වවිද්‍යාල කෙටි සටහන (Sinhala Summary): ${cleanTitle}

#### 1. මූලික සංකල්ප සහ හැඳින්වීම
• **විෂය සාරාංශය**: ${cleanTitle} යටතේ උගන්වනු ලබන මූලික න්‍යායාත්මක කරුණු සහ ඒවා ප්‍රායෝගික ගැටළු විසඳීමට යොදාගන්නා ආකාරය මෙහිදී සාකච්ඡා කෙරේ.

#### 2. ප්‍රධාන කරුණු (Key Lecture Takeaways)
${
  paragraphs.length > 0
    ? paragraphs.slice(0, 3).map((p, idx) => `• **කරුණ ${idx + 1}**: ${p}`).join('\n')
    : `• පාඩමේ ඇති මූලික නිර්වචන සහ න්‍යායන් හොඳින් අවබෝධ කර ගැනීම.\n• පියවරෙන් පියවර ගණනය කිරීම් සහ ප්‍රායෝගික විසඳුම් අධ්‍යයනය.\n• විභාග ප්‍රශ්න සඳහා නිතර අසන ප්‍රධාන කොටස් හඳුනා ගැනීම.`
}

#### 3. විභාගය ජයගැනීමට උපදෙස් (Exam Revision Tips)
• සූත්‍ර (Formulae), ක්‍රමවේද (Algorithms/Architectures) සහ ප්‍රස්ථාර (Diagrams) නැවත නැවත ඇඳ පුරුදු වන්න.
• පසුගිය විභාග ප්‍රශ්න පත්‍ර (Past Papers) විසඳීමෙන් දැනුම තහවුරු කරගන්න.`;

  const keyPoints = [
    `Foundational understanding of ${cleanTitle} mechanisms`,
    'Step-by-step application of core methodologies and calculations',
    'Identification of boundary edge-cases and optimization trade-offs',
    'Active revision of diagrams, flowcharts, and past paper problem patterns',
  ];

  return { summaryEnglish: engSummary, summarySinhala: sinSummary, keyPoints };
}

/**
 * Intelligent Quiz Generator from Lecture Notes
 */
export function generateQuizFromNote(
  title: string,
  content: string,
  summaryEnglish: string,
  questionCount: number = 5
): QuizQuestion[] {
  const cleanTitle = title.trim() || 'Lecture Quiz';
  const lower = (content + ' ' + title).toLowerCase();
  const isEnglish =
    lower.includes('english') || lower.includes('ielts') || lower.includes('grammar');

  if (isEnglish) {
    const englishQuestions: QuizQuestion[] = [
      {
        id: 'q-eng-1-' + Date.now(),
        question: `In academic English writing regarding "${cleanTitle}", which cohesive device is best suited to introduce an opposing viewpoint?`,
        options: ['Furthermore', 'In contrast,', 'Consequently', 'In other words'],
        correctAnswerIndex: 1,
        explanation: '"In contrast," is used to introduce an opposing or contrary fact/idea, whereas "Furthermore" adds supporting points.',
      },
      {
        id: 'q-eng-2-' + Date.now(),
        question: `Which word is the most appropriate academic synonym for "very big" in the context of "${cleanTitle}"?`,
        options: ['Substantial', 'Good', 'Plenty', 'Huge'],
        correctAnswerIndex: 0,
        explanation: '"Substantial" or "Significant" is the formal academic register preferred in IELTS and academic texts.',
      },
      {
        id: 'q-eng-3-' + Date.now(),
        question: `When summarizing main ideas in "${cleanTitle}", what is the primary role of a topic sentence?`,
        options: [
          'To introduce minor supporting statistics',
          'To state the main argument or theme of the paragraph',
          'To conclude the entire essay',
          'To list external bibliographic references',
        ],
        correctAnswerIndex: 1,
        explanation: 'A topic sentence clearly states the central focus and main argument of the paragraph.',
      },
      {
        id: 'q-eng-4-' + Date.now(),
        question: `Which sentence demonstrates correct grammatical parallelism?`,
        options: [
          'She likes reading, writing, and to analyze data.',
          'She likes reading, writing, and analyzing data.',
          'She likes to read, writing, and analysis.',
          'She likes reading, write, and analyze.',
        ],
        correctAnswerIndex: 1,
        explanation: 'Parallel structures maintain identical grammatical forms: reading, writing, and analyzing (-ing gerunds).',
      },
      {
        id: 'q-eng-5-' + Date.now(),
        question: `What is the most effective approach to prepare for vocabulary questions in "${cleanTitle}"?`,
        options: [
          'Memorize words in isolated alphabetical lists without context',
          'Learn collocations, word families, and use words in sentences',
          'Avoid reading academic texts',
          'Translate every single word literally into native language',
        ],
        correctAnswerIndex: 1,
        explanation: 'Learning collocations and word families in authentic context ensures natural, fluent usage.',
      },
    ];
    return englishQuestions.slice(0, questionCount);
  }

  // University / Technical Quiz Questions
  const uniQuestions: QuizQuestion[] = [
    {
      id: 'q-uni-1-' + Date.now(),
      question: `What is the primary objective of studying "${cleanTitle}" in modern university coursework?`,
      options: [
        `To understand foundational theoretical principles and real-world system applications`,
        'To avoid practical lab assignments',
        'To eliminate the need for systematic testing and verification',
        'To use deprecated legacy methodologies exclusively',
      ],
      correctAnswerIndex: 0,
      explanation: `Understanding foundational theories allows students to build reliable, optimized solutions for ${cleanTitle}.`,
    },
    {
      id: 'q-uni-2-' + Date.now(),
      question: `When analyzing performance trade-offs in "${cleanTitle}", which two factors are most commonly balanced?`,
      options: [
        'Time Complexity vs. Space/Memory Complexity',
        'Font color vs. Line spacing',
        'Keyboard layout vs. Screen brightness',
        'Network cables vs. Monitor refresh rate',
      ],
      correctAnswerIndex: 0,
      explanation: 'Computational systems prioritize balancing execution time (Time complexity) with memory usage (Space complexity).',
    },
    {
      id: 'q-uni-3-' + Date.now(),
      question: `In the context of "${cleanTitle}", what is the significance of validating boundary conditions and edge cases?`,
      options: [
        'Boundary cases have zero impact on system behavior',
        'It prevents unexpected runtime exceptions and system crashes',
        'It increases manual testing time without adding value',
        'It is only done after the software is decommissioned',
      ],
      correctAnswerIndex: 1,
      explanation: 'Testing extreme values and edge conditions ensures resilience and correctness across all valid inputs.',
    },
    {
      id: 'q-uni-4-' + Date.now(),
      question: `Which methodology provides the most effective revision strategy for "${cleanTitle}" before final semester exams?`,
      options: [
        'Passive re-reading of slides without self-testing',
        'Active recall, solving past exam questions, and explaining core concepts',
        'Cramming unfamiliar modules 1 hour before the exam',
        'Skipping lecture summaries and diagram derivations',
      ],
      correctAnswerIndex: 1,
      explanation: 'Active recall and timed past paper practice have been scientifically proven to maximize long-term retention and exam scores.',
    },
    {
      id: 'q-uni-5-' + Date.now(),
      question: `What is the role of modular architecture when implementing solutions for "${cleanTitle}"?`,
      options: [
        'Decouples components, simplifies debugging, and enhances reusability',
        'Creates massive monolithic files with tightly bound dependencies',
        'Slows down collaborative teamwork',
        'Removes all abstraction layers',
      ],
      correctAnswerIndex: 0,
      explanation: 'Modularity breaks complex systems into independent, testable components that are easier to maintain.',
    },
  ];

  return uniQuestions.slice(0, questionCount);
}

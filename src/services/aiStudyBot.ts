export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedSubtasks?: string[];
}

export interface BotContext {
  taskTitle?: string;
  categoryName?: string;
  subcategoryName?: string;
}

export function generateBotResponse(userMessage: string, context?: BotContext): {
  reply: string;
  suggestedSubtasks?: string[];
} {
  const query = userMessage.trim().toLowerCase();
  const taskName = context?.taskTitle || 'Your Study Goal';
  const catName = context?.categoryName || 'University Studies';
  const subName = context?.subcategoryName || '';

  // 1. Request to break down task or generate subtasks / steps
  if (
    query.includes('break') ||
    query.includes('step') ||
    query.includes('subtask') ||
    query.includes('plan') ||
    query.includes('hadanna') ||
    query.includes('kotas') ||
    query.includes('divide')
  ) {
    if (subName.toLowerCase().includes('exam') || taskName.toLowerCase().includes('exam') || taskName.toLowerCase().includes('revision')) {
      return {
        reply: `🎯 Here is an exam-focused revision roadmap for **${taskName}**:\n\n1. **Core Concepts Review**: Consolidate lecture slides & formula sheets (40m).\n2. **Past Paper Drilling**: Solve at least 2 past exam question sets under timed conditions (60m).\n3. **Weak Area Debugging**: Cross-reference mistake log with textbook / professor notes (30m).\n4. **Active Recall & Flashcards**: Quick 15m review before rest.\n\nWould you like me to add these steps as subtasks?`,
        suggestedSubtasks: [
          'Lecture Slides & Formula Summary',
          'Past Paper Solving (Timed)',
          'Weak Topic Debugging & Error Log',
          'Active Recall Quick Quiz',
        ],
      };
    } else if (subName.toLowerCase().includes('ielts') || catName.toLowerCase().includes('english') || taskName.toLowerCase().includes('english')) {
      return {
        reply: `🌍 Great! Here is a high-scoring study breakdown for **${taskName}**:\n\n1. **Vocabulary & Collocation Drill**: 15 academic collocations & band 8+ phrases.\n2. **Structure & Template**: Plan introduction, 2 body paragraphs & cohesive conclusion.\n3. **Timed Writing/Speaking Execution**: Practice under 20-40 min exam timer.\n4. **Self-Correction & Grammar Polish**: Audit for article errors & complex sentence structures.`,
        suggestedSubtasks: [
          'Band 8+ Collocations & Idioms Drill',
          'Essay Outline & Cohesive Device Map',
          'Timed Execution Practice',
          'Grammar & Lexical Resource Review',
        ],
      };
    } else {
      return {
        reply: `🚀 Here is a structured action plan to complete **${taskName}** efficiently:\n\n1. **Requirements & Scope Definition**: Review syllabus/rubric guidelines thoroughly.\n2. **Drafting Architecture / Skeleton**: Outline main sections or system diagrams.\n3. **Implementation & Core Work**: Focused 45-minute Pomodoro deep work sprint.\n4. **Proofreading, Testing & Final Verification**: Quality check against rubric deliverables.`,
        suggestedSubtasks: [
          'Review Rubric & Assignment Guidelines',
          'Draft Architecture / Section Outline',
          'Core Implementation Sprint',
          'Proofread & Final Verification',
        ],
      };
    }
  }

  // 2. Study tips / Focus / Time management
  if (query.includes('focus') || query.includes('time') || query.includes('schedule') || query.includes('pomodoro') || query.includes('velawa')) {
    return {
      reply: `⏱️ **Study Smart Strategy for ${taskName}**:\n\n• **25/5 Pomodoro Cycle**: 25 min high-intensity focus, 5 min stretch break.\n• **Eliminate Friction**: Put your phone on 'Do Not Disturb' and keep only relevant tabs open.\n• **Active Recall over Passive Reading**: Test yourself after every page instead of just reading.\n\nKeep your streak going! You've got this! 🌟`,
      suggestedSubtasks: [
        'Set 25-minute Pomodoro Sprint',
        'Active Recall Question Sheet',
      ],
    };
  }

  // 3. Concept explanation or questions
  if (query.includes('what is') || query.includes('explain') || query.includes('terum') || query.includes('help') || query.includes('kohomada')) {
    return {
      reply: `💡 **AI Academic Advisor**:\n\nFor **${taskName}** (${catName}${subName ? ` • ${subName}` : ''}), the best approach is:\n\n1. **Understand First Principles**: Break down definitions into simple language.\n2. **Apply with an Example**: Solve a real-world use case or write an illustrative example.\n3. **Teach It (Feynman Technique)**: Explain it out loud as if teaching a classmate.\n\nAsk me anything specific about your modules, formulas, or grammar points!`,
    };
  }

  // 4. Default conversational response
  return {
    reply: `👋 Hello! I am your **Study AI Assistant**.\n\nI can help you with:\n• Breaking down **${taskName}** into actionable subtasks 📋\n• Crafting revision roadmaps for **${catName}** 🎯\n• Exam tips, active recall questions & English fluency practice 🌍\n\nHow would you like to proceed today?`,
    suggestedSubtasks: [
      `Review key concepts for ${taskName}`,
      `Practice quiz for ${catName}`,
    ],
  };
}

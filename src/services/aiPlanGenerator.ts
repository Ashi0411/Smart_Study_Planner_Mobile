import { SubPlan } from '@/types/study';

interface GenerateOptions {
  goalTitle: string;
  subjectName: string;
  timeframeDays: number;
  intensity: 'crash' | 'balanced' | 'light';
}

export function generateAISubPlans(options: GenerateOptions): SubPlan[] {
  const { goalTitle, subjectName, timeframeDays, intensity } = options;

  const durationMultiplier = intensity === 'crash' ? 1.5 : intensity === 'light' ? 0.75 : 1.0;
  const baseMinutes = Math.round(60 * durationMultiplier);

  const cleanTitle = goalTitle.trim();
  const lower = cleanTitle.toLowerCase();

  // Smart domain detection for realistic curriculum templates
  let phases: { title: string; desc: string; mins: number }[] = [];

  if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz') || lower.includes('midterm') || lower.includes('final')) {
    phases = [
      {
        title: `Comprehensive Syllabus Overview & Key Formulas for ${cleanTitle}`,
        desc: `Skim high-yield chapters, highlight unknown definitions, and compile a one-page formula sheet.`,
        mins: Math.round(baseMinutes * 1.2),
      },
      {
        title: `Deep-Dive on Weak Topics & Core Theory (${subjectName})`,
        desc: `Target the 3 hardest chapters/topics, re-read textbook sections, and watch concept breakdown videos.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Standard Practice Questions & Worked Examples`,
        desc: `Solve textbook chapter-end exercises and past question batches without looking at solution keys.`,
        mins: Math.round(baseMinutes * 1.3),
      },
      {
        title: `Timed Past Paper / Mock Exam Simulation`,
        desc: `Simulate real exam conditions under timed constraints to test recall speed and accuracy.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Mistake Analysis & Weak Point Patching`,
        desc: `Review all incorrect questions from the mock exam, re-solve them, and verify correct methodology.`,
        mins: Math.round(baseMinutes * 0.8),
      },
      {
        title: `Final Quick-Recall Review & Mind Mapping`,
        desc: `Active recall with flashcards/formula sheet, memory check, and organize notes for test day.`,
        mins: Math.round(baseMinutes * 0.7),
      },
    ];
  } else if (lower.includes('project') || lower.includes('app') || lower.includes('assignment') || lower.includes('paper') || lower.includes('essay')) {
    phases = [
      {
        title: `Project Scope, Requirements & Literature Research`,
        desc: `Gather reference materials, define project goals, and outline the core deliverables.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Drafting Architecture / Section Outline`,
        desc: `Create structured modular sections, wireframes, or drafting points before diving into production.`,
        mins: Math.round(baseMinutes * 1.1),
      },
      {
        title: `Core Execution & Main Implementation (Phase 1)`,
        desc: `Build primary components or write the main arguments with reference citations.`,
        mins: Math.round(baseMinutes * 1.8),
      },
      {
        title: `Secondary Features, Refinements & Supporting Details`,
        desc: `Implement secondary features, add supporting paragraphs, and fill in missing calculations.`,
        mins: Math.round(baseMinutes * 1.4),
      },
      {
        title: `Testing, Debugging & Proofreading Review`,
        desc: `Proofread document for clarity and grammar, or run test suites to verify system stability.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Final Formatting & Submission Polish`,
        desc: `Ensure formatting meets all guidelines, package code or export final PDF for submission.`,
        mins: Math.round(baseMinutes * 0.6),
      },
    ];
  } else {
    // General study / chapter mastery
    phases = [
      {
        title: `Foundations: Concept Introduction & Terminology`,
        desc: `Read introductory chapter, extract primary definitions, and understand key principles.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Core Mechanics & Analytical Deep-Dive`,
        desc: `Study step-by-step worked examples and solve guided exercises in ${subjectName}.`,
        mins: Math.round(baseMinutes * 1.4),
      },
      {
        title: `Independent Problem Solving & Case Studies`,
        desc: `Apply knowledge on unguided problems to build problem-solving intuition and confidence.`,
        mins: Math.round(baseMinutes * 1.3),
      },
      {
        title: `Synthesis: Summary Notes & Feynman Technique`,
        desc: `Explain core concepts in simple terms without notes to test depth of understanding.`,
        mins: Math.round(baseMinutes * 0.9),
      },
      {
        title: `Spaced Repetition & Retention Review`,
        desc: `Spaced active recall session to transfer knowledge into long-term memory.`,
        mins: Math.round(baseMinutes * 0.7),
      },
    ];
  }

  // Calculate distributed target dates across the timeframe
  const today = new Date();
  const dayStep = Math.max(1, Math.floor(timeframeDays / phases.length));

  return phases.map((p, index) => {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + Math.min(timeframeDays, (index + 1) * dayStep));
    const dateStr = targetDate.toISOString().split('T')[0];

    return {
      id: `sp-${Date.now()}-${index}`,
      title: p.title,
      description: p.desc,
      estimatedMinutes: p.mins,
      completed: false,
      dueDate: dateStr,
    };
  });
}

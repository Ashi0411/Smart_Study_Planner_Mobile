import { SubPlan } from '@/types/study';

interface GenerateOptions {
  goalTitle: string;
  categoryName: string;
  subcategoryName?: string;
  timeframeDays: number;
  intensity: 'crash' | 'balanced' | 'light';
}

export function generateAISubPlans(options: GenerateOptions): SubPlan[] {
  const { goalTitle, categoryName, subcategoryName, timeframeDays, intensity } = options;

  const durationMultiplier = intensity === 'crash' ? 1.5 : intensity === 'light' ? 0.75 : 1.0;
  const baseMinutes = Math.round(60 * durationMultiplier);

  const cleanTitle = goalTitle.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerCat = categoryName.toLowerCase();

  let phases: { title: string; desc: string; mins: number }[] = [];

  if (lowerCat.includes('market') || lowerTitle.includes('marketing') || lowerTitle.includes('blog') || lowerTitle.includes('content') || lowerTitle.includes('social')) {
    phases = [
      {
        title: `Market Research & Audience Definition for ${cleanTitle}`,
        desc: `Analyze audience personas, competitor campaigns, search keywords, and target trends.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Content Strategy & Copywriting Outline`,
        desc: `Draft content headlines, narrative angle, key selling points, and call-to-actions.`,
        mins: Math.round(baseMinutes * 1.2),
      },
      {
        title: `Asset Production & Creative Media Assembly`,
        desc: `Produce high-quality creative assets, banners, copy variants, and landing page elements.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Campaign Distribution & Channel Scheduling`,
        desc: `Schedule posts, configure email newsletters, and verify automated publishing pipelines.`,
        mins: Math.round(baseMinutes * 1.1),
      },
      {
        title: `Analytics Tracking & Conversion Review`,
        desc: `Review reach, click-through rates, user feedback, and refine future campaign performance.`,
        mins: Math.round(baseMinutes * 0.9),
      },
    ];
  } else if (lowerCat.includes('project') || lowerCat.includes('work') || lowerTitle.includes('work') || lowerTitle.includes('client') || lowerTitle.includes('meeting')) {
    phases = [
      {
        title: `Project Scope & Requirement Gathering for ${cleanTitle}`,
        desc: `Document deliverables, establish stakeholder communication, and align timelines.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Core Architecture & Milestone Planning`,
        desc: `Break work into achievable sprint increments and set up required collaboration tools.`,
        mins: Math.round(baseMinutes * 1.2),
      },
      {
        title: `Execution & Production Sprint`,
        desc: `Focus on delivering primary work milestones, solving blockers, and integrating feedback.`,
        mins: Math.round(baseMinutes * 1.8),
      },
      {
        title: `Review, Quality Check & Client Sync`,
        desc: `Validate deliverables against requirements, rehearse presentations, and verify deliverables.`,
        mins: Math.round(baseMinutes * 1.3),
      },
      {
        title: `Final Sign-off & Delivery Wrap-up`,
        desc: `Present completed outcomes, record action items, and archive project notes.`,
        mins: Math.round(baseMinutes * 0.8),
      },
    ];
  } else if (lowerCat.includes('english') || lowerCat.includes('language') || lowerTitle.includes('ielts') || lowerTitle.includes('english')) {
    phases = [
      {
        title: `Vocabulary Foundations & Collocations Review`,
        desc: `Master high-frequency academic vocabulary, idioms, and context-specific sentence examples.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Active Listening & Accent Comprehension Practice`,
        desc: `Listen to podcasts/lecture recordings, take live notes, and summarize audio in your own words.`,
        mins: Math.round(baseMinutes * 1.2),
      },
      {
        title: `Reading Speed Drills & Skim/Scan Technique`,
        desc: `Timed passage readings, identifying main ideas, and answering comprehension questions.`,
        mins: Math.round(baseMinutes * 1.3),
      },
      {
        title: `Structured Writing Formulation & Cohesion Polish`,
        desc: `Write structured essays or reports, focusing on paragraph transitions and grammar variety.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Speaking Fluency & Timed Monologue / Dialogue Drills`,
        desc: `Record spontaneous speaking answers, analyze pauses, and refine pronunciation clarity.`,
        mins: Math.round(baseMinutes * 1.1),
      },
    ];
  } else if (lowerCat.includes('university') || lowerCat.includes('academic') || lowerTitle.includes('exam') || lowerTitle.includes('lecture')) {
    phases = [
      {
        title: `Syllabus Audit & Core Reading Breakdown (${subcategoryName || categoryName})`,
        desc: `Audit lecture slides and textbook chapters for ${cleanTitle}; highlight essential formulas & key ideas.`,
        mins: Math.round(baseMinutes * 1.1),
      },
      {
        title: `In-Depth Problem Solving & Practical Exercises`,
        desc: `Solve tutorial problem sheets, lab questions, and theoretical proofs step-by-step.`,
        mins: Math.round(baseMinutes * 1.6),
      },
      {
        title: `Midterm / Assignment Milestone Execution`,
        desc: `Complete primary assignment deliverables or draft project submissions with references.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Timed Past Paper Examination Rehearsal`,
        desc: `Simulate previous years' university exam questions under strict time constraints.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Weak Points Patching & Summary Cheat Sheet`,
        desc: `Consolidate one-page condensed revision sheet and re-verify difficult questions.`,
        mins: Math.round(baseMinutes * 0.9),
      },
    ];
  } else if (lowerCat.includes('personal') || lowerCat.includes('life') || lowerCat.includes('fitness') || lowerCat.includes('habit')) {
    phases = [
      {
        title: `Goal Clarity, Success Metrics & Environment Setup`,
        desc: `Define measurable benchmarks for ${cleanTitle}, remove friction, and set up your tracking routine.`,
        mins: Math.round(baseMinutes * 0.8),
      },
      {
        title: `Daily Habit Anchor & Initial Execution Phase`,
        desc: `Execute the first high-leverage actions and establish consistent daily momentum.`,
        mins: Math.round(baseMinutes * 1.2),
      },
      {
        title: `Overcoming Plateaus & Routine Optimization`,
        desc: `Assess initial friction points, refine methodology, and increase intensity or focus.`,
        mins: Math.round(baseMinutes * 1.3),
      },
      {
        title: `Milestone Assessment & Consistency Sprint`,
        desc: `Review measurable progress, celebrate milestones, and complete intermediate targets.`,
        mins: Math.round(baseMinutes * 1.1),
      },
      {
        title: `System Review & Long-Term Integration`,
        desc: `Automate habits, document key learnings, and lock in long-term discipline.`,
        mins: Math.round(baseMinutes * 0.7),
      },
    ];
  } else {
    // General structured plan
    phases = [
      {
        title: `Phase 1: Research, Prerequisites & Foundation Setup`,
        desc: `Collect materials, set expectations, and establish core principles for ${cleanTitle}.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Phase 2: Core Deep Dive & Practical Skill Building`,
        desc: `Engage in structured study and hands-on exercises tailored to ${categoryName}.`,
        mins: Math.round(baseMinutes * 1.5),
      },
      {
        title: `Phase 3: Applied Execution & Real-World Problem Solving`,
        desc: `Apply knowledge independently without notes to solidify understanding.`,
        mins: Math.round(baseMinutes * 1.4),
      },
      {
        title: `Phase 4: Review, Active Recall & Mistake Rectification`,
        desc: `Test retention, identify weak spots, and optimize retention.`,
        mins: Math.round(baseMinutes * 1.0),
      },
      {
        title: `Phase 5: Final Milestone Wrap-up & Output Verification`,
        desc: `Final review, packaging work, and celebrating milestone completion.`,
        mins: Math.round(baseMinutes * 0.8),
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

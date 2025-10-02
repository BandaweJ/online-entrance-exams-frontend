import { Exam, Section } from '../../models/exam.model';

/**
 * Utility functions for calculating exam statistics dynamically
 */
export class ExamCalculationsUtil {
  
  /**
   * Calculate total questions in an exam from its sections
   */
  static calculateTotalQuestions(exam: Exam): number {
    if (!exam.sections || exam.sections.length === 0) {
      return 0;
    }
    
    return exam.sections.reduce((total: number, section: Section) => {
      return total + (section.questionCount || 0);
    }, 0);
  }

  /**
   * Calculate total marks in an exam from its sections
   */
  static calculateTotalMarks(exam: Exam): number {
    if (!exam.sections || exam.sections.length === 0) {
      return 0;
    }
    
    return exam.sections.reduce((total: number, section: Section) => {
      const sectionMarks = parseFloat(section.totalMarks?.toString() || '0');
      return total + sectionMarks;
    }, 0);
  }

  /**
   * Calculate total questions in a section from its questions
   */
  static calculateSectionQuestions(section: Section): number {
    if (!section.questions || section.questions.length === 0) {
      return 0;
    }
    
    return section.questions.length;
  }

  /**
   * Calculate total marks in a section from its questions
   */
  static calculateSectionMarks(section: Section): number {
    if (!section.questions || section.questions.length === 0) {
      return 0;
    }
    
    return section.questions.reduce((total: number, question: any) => {
      return total + (question.marks || 0);
    }, 0);
  }

  /**
   * Get exam statistics with calculated values
   */
  static getExamStatistics(exam: Exam): {
    totalQuestions: number;
    totalMarks: number;
    sectionStats: Array<{
      sectionId: string;
      sectionTitle: string;
      questionCount: number;
      totalMarks: number;
    }>;
  } {
    const totalQuestions = this.calculateTotalQuestions(exam);
    const totalMarks = this.calculateTotalMarks(exam);
    
    const sectionStats = (exam.sections || []).map((section: Section) => ({
      sectionId: section.id,
      sectionTitle: section.title,
      questionCount: section.questionCount || 0,
      totalMarks: parseFloat(section.totalMarks?.toString() || '0')
    }));

    return {
      totalQuestions,
      totalMarks,
      sectionStats
    };
  }

  /**
   * Check if exam statistics are consistent
   */
  static areStatisticsConsistent(exam: Exam): {
    isConsistent: boolean;
    discrepancies: string[];
  } {
    const calculated = this.getExamStatistics(exam);
    const discrepancies: string[] = [];

    // Check total questions
    if (exam.totalQuestions !== calculated.totalQuestions) {
      discrepancies.push(
        `Total questions mismatch: stored=${exam.totalQuestions}, calculated=${calculated.totalQuestions}`
      );
    }

    // Check total marks
    const storedMarks = parseFloat(exam.totalMarks?.toString() || '0');
    if (Math.abs(storedMarks - calculated.totalMarks) > 0.01) {
      discrepancies.push(
        `Total marks mismatch: stored=${storedMarks}, calculated=${calculated.totalMarks}`
      );
    }

    return {
      isConsistent: discrepancies.length === 0,
      discrepancies
    };
  }
}

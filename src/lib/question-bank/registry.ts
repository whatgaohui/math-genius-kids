// ═══════════════════════════════════════════════════════════════════════════════
// Modular Question Bank — Registry (注册中心)
// ─────────────────────────────────────────────────────────────────────────────
// Central registry for all question banks. Banks register themselves here,
// and consumers query the registry to get the appropriate bank for a subject.
//
// Usage:
//   import { QuestionBankRegistry } from './registry';
//
//   // Register a bank
//   QuestionBankRegistry.register(myMathBank, { priority: 10 });
//
//   // Get a bank for a subject
//   const bank = QuestionBankRegistry.getBank('math');
//
//   // Get all registered banks
//   const allBanks = QuestionBankRegistry.getAllBanks();
//
//   // Replace a bank (for hot-swapping)
//   QuestionBankRegistry.replace('math-pep-v1', newMathBank);
// ═══════════════════════════════════════════════════════════════════════════════

import type { Subject, QuestionBank, BankRegistration } from './types';

type RegistrationOptions = {
  /** Priority (default: 5). Higher = preferred when multiple banks exist. */
  priority?: number;
  /** Whether to enable immediately (default: true) */
  enabled?: boolean;
};

class QuestionBankRegistryClass {
  private banks: Map<string, BankRegistration> = new Map();
  private subjectIndex: Map<Subject, string[]> = new Map();

  // ─── Registration ───────────────────────────────────────────────────────

  /**
   * Register a question bank.
   * If a bank with the same ID already exists, it will be replaced.
   */
  register<T extends QuestionBank>(bank: T, options?: RegistrationOptions): void {
    const registration: BankRegistration = {
      bank,
      priority: options?.priority ?? 5,
      enabled: options?.enabled ?? true,
      registeredAt: Date.now(),
    };

    const existing = this.banks.get(bank.id);
    this.banks.set(bank.id, registration);

    // Update subject index
    if (!existing || existing.bank.subject !== bank.subject) {
      this.rebuildSubjectIndex();
    }
  }

  /**
   * Unregister a bank by ID.
   */
  unregister(bankId: string): boolean {
    const existing = this.banks.get(bankId);
    if (!existing) return false;
    this.banks.delete(bankId);
    this.rebuildSubjectIndex();
    return true;
  }

  /**
   * Replace a bank with a new instance (same ID).
   * Useful for hot-swapping question banks at runtime.
   */
  replace<T extends QuestionBank>(bankId: string, newBank: T, options?: RegistrationOptions): boolean {
    const existing = this.banks.get(bankId);
    if (!existing) {
      // If the old bank doesn't exist, just register the new one
      this.register(newBank, options);
      return false;
    }

    this.register(newBank, {
      priority: options?.priority ?? existing.priority,
      enabled: options?.enabled ?? existing.enabled,
    });
    return true;
  }

  // ─── Query ──────────────────────────────────────────────────────────────

  /**
   * Get a specific bank by its ID.
   */
  getBankById<T extends QuestionBank = QuestionBank>(bankId: string): T | undefined {
    const reg = this.banks.get(bankId);
    if (!reg || !reg.enabled) return undefined;
    return reg.bank as T;
  }

  /**
   * Get the highest-priority active bank for a given subject.
   * This is the primary way consumers should get a question bank.
   */
  getBank<T extends QuestionBank = QuestionBank>(subject: Subject): T | undefined {
    const bankIds = this.subjectIndex.get(subject);
    if (!bankIds || bankIds.length === 0) return undefined;

    // Sort by priority (highest first)
    const sorted = bankIds
      .map((id) => this.banks.get(id)!)
      .filter((r) => r && r.enabled)
      .sort((a, b) => b.priority - a.priority);

    return sorted.length > 0 ? (sorted[0].bank as T) : undefined;
  }

  /**
   * Get ALL active banks for a given subject (sorted by priority).
   */
  getBanksForSubject<T extends QuestionBank = QuestionBank>(subject: Subject): T[] {
    const bankIds = this.subjectIndex.get(subject) ?? [];
    return bankIds
      .map((id) => this.banks.get(id))
      .filter((r): r is BankRegistration => !!r && r.enabled)
      .sort((a, b) => b.priority - a.priority)
      .map((r) => r.bank as T);
  }

  /**
   * Get all registered banks (including disabled ones).
   */
  getAllBanks(): BankRegistration[] {
    return Array.from(this.banks.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get only active (enabled) banks.
   */
  getActiveBanks(): BankRegistration[] {
    return this.getAllBanks().filter((r) => r.enabled);
  }

  // ─── Management ─────────────────────────────────────────────────────────

  /**
   * Enable a bank.
   */
  enable(bankId: string): boolean {
    const reg = this.banks.get(bankId);
    if (!reg) return false;
    reg.enabled = true;
    return true;
  }

  /**
   * Disable a bank.
   */
  disable(bankId: string): boolean {
    const reg = this.banks.get(bankId);
    if (!reg) return false;
    reg.enabled = false;
    return true;
  }

  /**
   * Check if a bank exists and is enabled.
   */
  isActive(bankId: string): boolean {
    const reg = this.banks.get(bankId);
    return !!reg && reg.enabled;
  }

  /**
   * Check if any bank is registered for a subject.
   */
  hasSubject(subject: Subject): boolean {
    const bank = this.getBank(subject);
    return !!bank;
  }

  /**
   * Clear all registrations (useful for testing).
   */
  clear(): void {
    this.banks.clear();
    this.subjectIndex.clear();
  }

  /**
   * Get a summary of all registered banks.
   */
  getSummary(): {
    totalBanks: number;
    activeBanks: number;
    subjects: { subject: Subject; bankCount: number; primaryBank: string | undefined }[];
  } {
    const subjects: Subject[] = ['math', 'chinese', 'english'];
    return {
      totalBanks: this.banks.size,
      activeBanks: this.getActiveBanks().length,
      subjects: subjects.map((subject) => {
        const banks = this.getBanksForSubject(subject);
        return {
          subject,
          bankCount: banks.length,
          primaryBank: banks[0]?.id,
        };
      }),
    };
  }

  // ─── Internal ───────────────────────────────────────────────────────────

  private rebuildSubjectIndex(): void {
    this.subjectIndex.clear();
    for (const [id, reg] of this.banks) {
      const subject = reg.bank.subject;
      if (!this.subjectIndex.has(subject)) {
        this.subjectIndex.set(subject, []);
      }
      this.subjectIndex.get(subject)!.push(id);
    }
  }
}

// Singleton instance
export const QuestionBankRegistry = new QuestionBankRegistryClass();

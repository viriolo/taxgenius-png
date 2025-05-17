
/**
 * Audit Trail Service for Papua New Guinea Tax System
 * Creates a comprehensive audit trail system
 */

type ActionType = 
  | 'document_upload'
  | 'document_delete'
  | 'tax_calculation'
  | 'form_submission'
  | 'profile_update'
  | 'login'
  | 'logout'
  | 'signup'
  | 'payment'
  | 'data_validation'
  | 'compliance_check'
  | 'report_generation'
  | 'document_processing'
  | 'ai_tax_calculation'
  | 'ai_strategic_planning'
  | 'ai_international_transaction'
  | 'ai_business_decision'
  | 'ai_professional_referral';

interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: ActionType;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditTrailService {
  private auditTrail: AuditEntry[] = [];
  private static instance: AuditTrailService;

  // Singleton pattern
  public static getInstance(): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService();
    }
    return AuditTrailService.instance;
  }

  /**
   * Log an action to the audit trail
   */
  public logAction(
    userId: string,
    action: ActionType,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      userId,
      action,
      details,
      ipAddress,
      userAgent
    };

    this.auditTrail.push(auditEntry);
    
    // In a real implementation, this would be sent to a backend service
    console.log(`Audit log: ${action} by user ${userId}`, details);
    
    // Placeholder for potential backend integration
    this.persistAuditEntry(auditEntry);
  }

  /**
   * Get the audit trail for a specific user
   */
  public getUserAuditTrail(userId: string): AuditEntry[] {
    return this.auditTrail.filter(entry => entry.userId === userId);
  }

  /**
   * Get the complete audit trail
   */
  public getFullAuditTrail(): AuditEntry[] {
    return [...this.auditTrail];
  }

  /**
   * Persist audit entry to storage/backend
   * This is a placeholder for actual implementation
   */
  private persistAuditEntry(entry: AuditEntry): void {
    // In a real app, this would send the data to a backend API
    // For now, we'll just store it in memory and localStorage for demo purposes
    
    try {
      const storedAuditTrail = localStorage.getItem('auditTrail');
      let auditTrailData = storedAuditTrail ? JSON.parse(storedAuditTrail) : [];
      
      // Add the new entry
      auditTrailData.push({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      });
      
      // Store in localStorage (for demo only - not for production use)
      localStorage.setItem('auditTrail', JSON.stringify(auditTrailData));
    } catch (error) {
      console.error('Failed to persist audit entry', error);
    }
  }

  /**
   * Clear the audit trail (for testing purposes only)
   */
  public clearAuditTrail(): void {
    this.auditTrail = [];
    try {
      localStorage.removeItem('auditTrail');
    } catch (error) {
      console.error('Failed to clear audit trail from localStorage', error);
    }
  }
}

export default AuditTrailService;

export type AuditActionType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "STOCK_ADJUSTMENT"
  | "CLIENT_ACTIVATED"
  | "CLIENT_SUSPENDED"
  | "CLIENT_REGISTERED"
  | "AI_TASK_APPROVED"
  | "AI_TASK_REJECTED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "USER_ROLE_CHANGED";

export type AuditEntityCategory = "STOCK" | "CLIENT" | "GOVERNANCE" | "SECURITY";

export interface AuditLogItem {
  id: string;
  actionType: AuditActionType;
  category: AuditEntityCategory;
  actionTitle: string;
  entityType: string;
  entityName: string;
  entityId: string;
  performedBy: {
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "STAFF" | "AI_AGENT";
  };
  details: string;
  ipAddress: string;
  auditHash: string;
  timestamp: string;
  severity: "NORMAL" | "WARNING" | "CRITICAL";
}

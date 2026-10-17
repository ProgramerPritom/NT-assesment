export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: "Inventory Operations" | "Inbound Receiving" | "Fulfillment & Dispatch" | "Executive & Compliance";
  shift: "Morning (08:00 - 16:00)" | "Evening (16:00 - 00:00)" | "Full Day Operations";
  lastLogin: string;
  createdAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  department: UserItem["department"];
  shift: UserItem["shift"];
  tempPassword?: string;
}

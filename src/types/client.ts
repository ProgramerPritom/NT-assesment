export type ClientStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";

export type PaymentTerms = "NET_15" | "NET_30" | "NET_60" | "IMMEDIATE";

export interface Client {
  id: string;
  name: string;
  code: string;
  category: "Tier-1 Hardware" | "Semiconductor" | "Peripherals" | "Logistics & Freight" | "OEM Manufacturer";
  taxNumber: string; // EIN / BIN
  email: string;
  phone: string;
  creditLimit: number;
  paymentTerms: PaymentTerms;
  status: ClientStatus;
  suspensionReason?: string;
  activeOrdersCount: number;
  ratingScore: number; // e.g. 98%
  createdAt: string;
}

export interface ClientFormData {
  name: string;
  category: Client["category"];
  taxNumber: string;
  email: string;
  phone: string;
  creditLimit: number;
  paymentTerms: PaymentTerms;
}

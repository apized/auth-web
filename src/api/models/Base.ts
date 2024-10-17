import { AuthUser } from "./Auth";

export type UUID = string;

export type Model = {
  id?: UUID;
  version?: number
  createdAt?: string
  createdBy?: string
  lastUpdatedAt?: string
  lastUpdatedBy?: string
  metadata?: { [key: string]: unknown };
};

export type ApizedAuditEntry = {
  action?: string;
  author?: AuthUser | UUID;
  payload: { [key: string]: unknown };
  reason?: string;
  target?: UUID;
  timestamp?: number;
  transactionId?: UUID;
  type?: string;
} & Model;

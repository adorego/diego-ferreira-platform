// ── Enums ───────────────────────────────────────────
export enum Role {
  PATIENT = 'PATIENT',
  ADMIN   = 'ADMIN',
}

export enum UserStatus {
  PROSPECT = 'PROSPECT',
  APPROVED = 'APPROVED',
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum SessionType {
  EXPLORATORY = 'exploratory',
  PLAN        = 'plan',
}

export enum AppStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PayStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED    = 'FAILED',
}

// ── Entidades ────────────────────────────────────────
export interface Patient {
  id:       number;
  name:     string;
  email:    string;
  country:  string;
  status:   UserStatus;
  sessions: Session[];
  payments: Payment[];
}

export interface Session {
  id:            number;
  type:          SessionType;
  status:        AppStatus;
  start?:        string;
  end?:          string;
  roomUrl?:      string;
  recordingUrl?: string;
  aiSummary?:    string;
  meetLink?:     string;
  patient:       Patient;
}

export interface Payment {
  id:               string;
  amount:           number;
  currency:         string;
  status:           PayStatus;
  bancardProcessId?: string;
  createdAt:        string;
  patient:          Patient;
}

export interface Plan {
  id:       string;
  name:     string;
  sessions: number;
  price:    number;
  currency: string;
}

export interface AvailabilitySlot {
  date:  string;       // "2026-06-01"
  slots: string[];     // ["09:00","10:00"]
}

export interface SessionSummary {
  id:           string;
  sessionId:    number;
  transcript:   string;
  summary:      string;
  createdAt:    string;
}
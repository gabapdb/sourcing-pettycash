import type { Timestamp } from "firebase/firestore";

/** Represents a client record in Firestore */
export interface Client {
  id: string;
  name: string;
  // allow Timestamp, null, or undefined to match Firestore data shapes
  createdAt?: Timestamp | null | undefined;
}

/** Represents a single Sourcing List document */
export interface SourcingDoc {
  id: string;
  title: string;
  createdAt: Timestamp;
}

/** Represents a single Petty Cash document */
export interface PettyCashDoc {
  id: string;
  title: string;
  createdAt: Timestamp | null;
}

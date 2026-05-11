export type HrProvider = "personio" | "lucca";

export type HrEmployee = {
  externalPersonId: string;
  email: string;
  fullName?: string | null;
};

export type HrAbsence = {
  externalAbsenceId: string;
  externalPersonId: string;
  status: "approved" | "pending" | "rejected" | "cancelled" | "unknown";
  type: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  note?: string | null;
  updatedAt?: string | null;
};

export type HrSyncWindow = {
  updatedSince?: string;
  updatedUntil?: string;
};

export type HrProviderClient = {
  provider: HrProvider;
  healthCheck: () => Promise<void>;
  listEmployees: () => Promise<HrEmployee[]>;
  listAbsences: (window: HrSyncWindow) => Promise<HrAbsence[]>;
};

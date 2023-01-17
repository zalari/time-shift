export type MiteDate =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | Date;

export type MiteUngroupedTimeEntry = {
  time_entry: MiteTimeEntry;
};

export type MiteGroupedTimeEntry = {
  time_entry_group: MiteTimeEntry;
};

export type MiteTrackingTimeEntry = {
  id: number;
  minutes: number;
  since: string;
};

export type MiteTimeEntryOptions = {
  user_id?: number;
  customer_id?: number;
  project_id?: number;
  service_id?: number;
  note?: string;
  at?: MiteDate;
  from?: MiteDate;
  to?: MiteDate;
  billable?: boolean;
  locked?: boolean;
  tracking?: boolean;
  sort?: 'date' | 'user' | 'customer' | 'project' | 'service' | 'note' | 'minutes' | 'revenue';
  direction?: 'asc' | 'desc';
  group_by?: Array<'user' | 'customer' | 'project' | 'service' | 'day' | 'week' | 'month' | 'year'>;
  limit?: number;
  page?: number;
};

export type MiteTimeEntryResponse = {
  time_entry: MiteTimeEntry;
};

export type MiteTimeEntry = {
  id: number;
  minutes: number;
  date_at: string;
  note: string;
  billable: boolean;
  locked: boolean;
  revenue: any;
  hourly_rate: number;
  user_id: number;
  user_name: string;
  project_id: number;
  project_name: string;
  customer_id: number;
  customer_name: string;
  service_id: number;
  service_name: string;
  created_at: string;
  updated_at: string;
  tracking?: MiteTrackingTimeEntry;
};

export type MiteAccount = {
  id: number;
  name: string;
  title: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
};

export type MiteMyself = {
  id: number;
  name: string;
  email: string;
  note: string;
  archived: boolean;
  role: string; // Time tracker, Co-worker, Administrator (admin), Account owner
  language: string;
  created_at: Date;
  updated_at: Date;
};

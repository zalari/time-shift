export namespace Mite {
  export type Commons = {
    id: number;
    created_at: Date;
    updated_at: Date;
  };

  export type Archivable = {
    name: string;
    note: string;
    archived: boolean;
  };

  export type Rated = {
    active_hourly_rate: null | 'hourly_rate' | 'hourly_rates_per_service';
    hourly_rate: number;
    hourly_rates_per_service: {
      service_id: number;
      hourly_rate: number;
    }[];
  };

  export type WrappedEntry<K extends string, R> = {
    [key in K]: R;
  };

  export type TrackingTimeEntry = Commons & {
    minutes: number;
    since: string;
  };

  export type TimeEntryOptions = {
    user_id?: number | number[];
    customer_id?: number | number[];
    project_id?: number | number[];
    service_id?: number | number[];
    note?: string | string[];
    at?:
      | 'today'
      | 'yesterday'
      | 'this_week'
      | 'last_week'
      | 'this_month'
      | 'last_month'
      | 'this_year'
      | 'last_year'
      | Date;
    from?: Date;
    to?: Date;
    billable?: boolean;
    locked?: boolean;
    tracking?: boolean;
    sort?: 'date' | 'user' | 'customer' | 'project' | 'service' | 'note' | 'minutes' | 'revenue';
    direction?: 'asc' | 'desc';
    group_by?: Array<
      'user' | 'customer' | 'project' | 'service' | 'day' | 'week' | 'month' | 'year'
    >;
    limit?: number;
    page?: number;
  };

  export type UngroupedTimeEntry = WrappedEntry<'time_entry', TimeEntry>;
  export type GroupedTimeEntry = WrappedEntry<'time_entry_group', TimeEntry>;

  export type TimeEntry = Commons & {
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
    tracking?: TrackingTimeEntry;
  };

  export type Account = Commons & {
    name: string;
    title: string;
    currency: string;
  };

  export type User = Commons &
    Archivable & {
      email: string;
      role: string; // Time tracker, Co-worker, Administrator (admin), Account owner
      language: string;
    };

  export type Myself = User;

  export type Customer = Commons & Rated & Archivable;

  export type Project = Commons &
    Rated &
    Archivable & {
      customer_id: number;
      customer_name: string;
      budget: number;
      budget_type: 'minutes' | 'minutes_per_month' | 'cents' | 'cents_per_month';
    };

  export type Service = Commons &
    Archivable & {
      billable: boolean;
      hourly_rate: number;
    };
}

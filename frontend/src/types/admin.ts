export interface ImportGraduatesResponse {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    errors: Array<{
      row?: number;
      error: string;
      data?: any[];
    }>;
  };
  errors?: Record<string, string[]>;
}

export interface CreateEventRequest {
  name: string;
  date: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    date: string;
    status: string;
  };
  errors?: Record<string, string[]>;
}

export interface CreateAuditoriumRequest {
  event_id: number;
  name: string;
  capacity: number;
}

export interface CreateAuditoriumResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    event_id: number;
    name: string;
    capacity: number;
    current_occupancy: number;
  };
  errors?: Record<string, string[]>;
}

export interface RevokeTicketResponse {
  success: boolean;
  message: string;
}

export interface AuditoriumMetrics {
  id: number;
  name: string;
  capacity: number;
  current_occupancy: number;
  available_capacity: number;
  occupancy_rate: number;
}

export interface EventMetrics {
  id: number;
  name: string;
  date: string;
  auditoriums_count: number;
  total_capacity: number;
  total_occupancy: number;
  occupancy_rate: number;
  auditoriums: AuditoriumMetrics[];
}

export interface DashboardAforoResponse {
  success: boolean;
  data?: {
    total_events: number;
    total_auditoriums: number;
    total_capacity: number;
    total_occupancy: number;
    occupancy_rate: number;
    events: EventMetrics[];
  };
  message?: string;
}

export interface Ticket {
  id: number;
  invitation_id: number;
  status: 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
  invitation?: {
    id: number;
    graduate_id: number;
    event_id: number;
    auditorium_id: number;
    status: string;
  };
}

export interface TicketsListResponse {
  success: boolean;
  data?: Ticket[];
  message?: string;
}
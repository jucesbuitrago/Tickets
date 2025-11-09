export interface GraduateProfile {
  id: number;
  user_id: number;
  cupos_permitidos: number;
  cupos_usados: number;
  cupos_disponibles: number;
}

export interface GraduateProfileResponse {
  success: boolean;
  data?: GraduateProfile;
  message?: string;
}

export interface Invitation {
  id: number;
  event_id: number;
  status: 'CREATED' | 'USED' | 'REVOKED' | 'EXPIRED';
  created_at: string;
  event?: {
    id: number;
    name: string;
    date: string;
  };
}

export interface InvitationsResponse {
  success: boolean;
  data?: Invitation[];
  message?: string;
}

export interface CreateInvitationRequest {
  event_id: number;
}

export interface CreateInvitationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    event_id: number;
    status: string;
    created_at: string;
  };
  errors?: Record<string, string[]>;
}

export interface DeleteInvitationResponse {
  success: boolean;
  message: string;
}

export interface Ticket {
  id: number;
  invitation_id: number;
  status: 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
  invitation?: {
    id: number;
    event_id: number;
    status: string;
    event?: {
      id: number;
      name: string;
      date: string;
    };
  };
}

export interface TicketsResponse {
  success: boolean;
  data?: Ticket[];
  message?: string;
}

export interface TicketQrResponse {
  success: boolean;
  data?: {
    qr_code: string; // Base64 encoded PNG
    format: string;
  };
  message?: string;
}
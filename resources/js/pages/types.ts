import React from 'react';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Category = 'Connectivity' | 'Performance' | 'Billing' | 'Equipment' | 'Service Request' | 'Installation' | 'Technical';
export type TicketType = 'Technical Issue' | 'Support Request' | 'Service Request' | 'Escalation' | 'General Inquiry';
export type EscalationLevel = 'Level 1' | 'Level 2' | 'Level 3';

export interface Customer {
  id: number;
  customer_name: string;
  account_number: string;
  primary_phone: string;
  email_address?: string;
  service_package: string;
  status: string;
  installation_date: string;
  lastPayment?: string;
}


export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  accountNumber: string;
  phone?: string;
  email?: string;
  category: string; // Keeps the topic/domain (e.g. Connectivity)
  ticketType: TicketType; // New classification
  escalationLevel: EscalationLevel; // New escalation status
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  lastUpdate: string;
  description?: string;
}

export interface NewTicketData {
  customerName: string;
  accountNumber: string;
  phone: string;
  email: string;
  subject: string;
  category: Category;
  ticketType: TicketType;
  escalationLevel: EscalationLevel;
  priority: Priority;
  description: string;
  assignedTo: string;
}

export interface SupportTicketListProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  onBack: () => void;
}

export interface DashboardProps {
  tickets: Ticket[];
  onNavigateToTickets: () => void;
}

export interface CustomerListTableProps {
  onBack: () => void;
  customers: Customer[];
}

export type InstallationStatus = 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Installation {
  id: string;
  customerName: string;
  address: string;
  contactNumber: string;
  scheduledDate: string;
  technician: string;
  equipment: string;
  status: InstallationStatus;
  notes?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestLevel: 'High' | 'Medium' | 'Low';
  status: LeadStatus;
  source: string;
  lastContact: string;
  notes?: string;
}

export interface InstallationsListProps {
  onBack: () => void;
}

export interface LeadsListProps {
  onBack: () => void;
}

// User & Role Management Types
export type UserRole = 'Admin' | 'Support Agent' | 'Technician' | 'Sales' | 'Manager';
export type UserStatus = 'Active' | 'Inactive' | 'Invited';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  avatarUrl?: string;
}

export interface UserRolesProps {
  onBack: () => void;
}

// System Settings Types
export interface MessagingConfig {
  provider: 'Twilio' | 'AfricaTalking' | 'Infobip' | 'Custom';
  apiKey: string;
  apiSecret: string;
  senderId: string;
  callbackUrl: string;
  enabled: boolean;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  username: string;
  password: string;
  senderEmail: string;
  enabled: boolean;
}

export interface SystemSettingsProps {
  onBack: () => void;
}

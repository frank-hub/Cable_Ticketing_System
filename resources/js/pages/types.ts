import React from 'react';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Category = 'Connectivity' | 'Performance' | 'Billing' | 'Equipment' | 'Service Request' | 'Installation' | 'Technical';

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  accountNumber: string;
  phone?: string;
  email?: string;
  category: string;
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

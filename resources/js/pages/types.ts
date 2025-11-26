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
}

export interface DashboardProps {
  tickets: Ticket[];
  onNavigateToTickets: () => void;
}

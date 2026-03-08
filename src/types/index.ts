export type UserRole = 'owner' | 'worker';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  department_id: string;
  position: string;
  salary: number;
  join_date: string;
  address?: string;
  profile_photo?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name: string;
  leave_type: 'casual' | 'sick' | 'annual' | 'unpaid';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  user_id: string;
  user_name: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  company?: string;
  address?: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  customer_name: string;
  assigned_to: string[];
  assigned_names: string[];
  status: OrderStatus;
  priority: OrderPriority;
  deadline: string;
  amount: number;
  created_at: string;
}

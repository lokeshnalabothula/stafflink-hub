import { User, Department, AttendanceRecord, LeaveRequest, PayrollRecord, ActivityLog, Customer, Order } from '@/types';

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Marketing' },
  { id: 'd3', name: 'Sales' },
  { id: 'd4', name: 'HR' },
  { id: 'd5', name: 'Finance' },
];

export const users: User[] = [
  { id: 'u1', name: 'Rajesh Kumar', mobile: '+919876543210', role: 'owner', department_id: 'd1', position: 'CEO', salary: 150000, join_date: '2020-01-15', address: '12 MG Road, Mumbai', created_at: '2020-01-15' },
  { id: 'u2', name: 'Priya Sharma', mobile: '+919876543211', role: 'worker', department_id: 'd1', position: 'Senior Developer', salary: 85000, join_date: '2021-03-10', address: '45 Park Street, Delhi', created_at: '2021-03-10' },
  { id: 'u3', name: 'Amit Patel', mobile: '+919876543212', role: 'worker', department_id: 'd2', position: 'Marketing Lead', salary: 72000, join_date: '2021-06-20', address: '78 Lake View, Bangalore', created_at: '2021-06-20' },
  { id: 'u4', name: 'Sneha Reddy', mobile: '+919876543213', role: 'worker', department_id: 'd3', position: 'Sales Executive', salary: 55000, join_date: '2022-01-05', address: '23 Hill Road, Hyderabad', created_at: '2022-01-05' },
  { id: 'u5', name: 'Vikram Singh', mobile: '+919876543214', role: 'worker', department_id: 'd4', position: 'HR Manager', salary: 68000, join_date: '2021-09-15', address: '56 Main Street, Pune', created_at: '2021-09-15' },
  { id: 'u6', name: 'Anita Desai', mobile: '+919876543215', role: 'worker', department_id: 'd5', position: 'Accountant', salary: 60000, join_date: '2022-04-12', address: '89 Ring Road, Chennai', created_at: '2022-04-12' },
  { id: 'u7', name: 'Karan Mehta', mobile: '+919876543216', role: 'worker', department_id: 'd1', position: 'Junior Developer', salary: 45000, join_date: '2023-02-01', address: '34 Sector 5, Noida', created_at: '2023-02-01' },
  { id: 'u8', name: 'Deepa Nair', mobile: '+919876543217', role: 'worker', department_id: 'd2', position: 'Content Writer', salary: 40000, join_date: '2023-05-18', address: '67 Beach Road, Kochi', created_at: '2023-05-18' },
];

export const customers: Customer[] = [
  { id: 'c1', name: 'TechVista Solutions', mobile: '+919800100100', email: 'contact@techvista.com', company: 'TechVista Solutions Pvt Ltd', address: '101 IT Park, Pune', created_at: '2024-06-10' },
  { id: 'c2', name: 'Global Exports Ltd', mobile: '+919800200200', email: 'info@globalexports.in', company: 'Global Exports Ltd', address: '45 Trade Centre, Mumbai', created_at: '2024-08-15' },
  { id: 'c3', name: 'Sunrise Retail', mobile: '+919800300300', email: 'orders@sunriseretail.com', company: 'Sunrise Retail Group', address: '78 Mall Road, Delhi', created_at: '2025-01-20' },
  { id: 'c4', name: 'Meera Fashions', mobile: '+919800400400', email: 'meera@meerafashions.in', company: 'Meera Fashions', address: '23 Silk Street, Bangalore', created_at: '2025-03-05' },
  { id: 'c5', name: 'Raj Construction', mobile: '+919800500500', email: 'raj@rajconstruction.co', company: 'Raj Construction Co', address: '56 Builder Lane, Hyderabad', created_at: '2025-06-12' },
];

export const orders: Order[] = [
  { id: 'o1', title: 'Website Redesign', description: 'Complete website overhaul with new branding', customer_id: 'c1', customer_name: 'TechVista Solutions', assigned_to: ['u2', 'u7'], assigned_names: ['Priya Sharma', 'Karan Mehta'], status: 'in-progress', priority: 'high', deadline: '2026-03-15', amount: 250000, created_at: '2026-02-20' },
  { id: 'o2', title: 'Marketing Campaign Q1', description: 'Digital marketing campaign for Q1 2026', customer_id: 'c2', customer_name: 'Global Exports Ltd', assigned_to: ['u3', 'u8'], assigned_names: ['Amit Patel', 'Deepa Nair'], status: 'in-progress', priority: 'medium', deadline: '2026-03-31', amount: 180000, created_at: '2026-01-15' },
  { id: 'o3', title: 'Sales Training Program', description: 'Custom sales training for 50 employees', customer_id: 'c3', customer_name: 'Sunrise Retail', assigned_to: ['u4'], assigned_names: ['Sneha Reddy'], status: 'pending', priority: 'medium', deadline: '2026-03-20', amount: 95000, created_at: '2026-03-01' },
  { id: 'o4', title: 'HR Software Integration', description: 'Integrate payroll system with existing HRMS', customer_id: 'c5', customer_name: 'Raj Construction', assigned_to: ['u2', 'u5'], assigned_names: ['Priya Sharma', 'Vikram Singh'], status: 'pending', priority: 'urgent', deadline: '2026-03-10', amount: 320000, created_at: '2026-03-05' },
  { id: 'o5', title: 'Brand Identity Package', description: 'Logo, stationery, and brand guidelines', customer_id: 'c4', customer_name: 'Meera Fashions', assigned_to: ['u3'], assigned_names: ['Amit Patel'], status: 'completed', priority: 'low', deadline: '2026-02-28', amount: 75000, created_at: '2026-01-10' },
  { id: 'o6', title: 'E-commerce Platform', description: 'Build full e-commerce site with payment integration', customer_id: 'c3', customer_name: 'Sunrise Retail', assigned_to: ['u2', 'u7'], assigned_names: ['Priya Sharma', 'Karan Mehta'], status: 'pending', priority: 'high', deadline: '2026-04-15', amount: 450000, created_at: '2026-03-07' },
  { id: 'o7', title: 'Financial Audit Report', description: 'Prepare quarterly financial audit', customer_id: 'c2', customer_name: 'Global Exports Ltd', assigned_to: ['u6'], assigned_names: ['Anita Desai'], status: 'in-progress', priority: 'high', deadline: '2026-03-12', amount: 120000, created_at: '2026-02-25' },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'a1', user_id: 'u2', date: '2026-03-08', check_in: '09:02', check_out: '18:15', status: 'present' },
  { id: 'a2', user_id: 'u3', date: '2026-03-08', check_in: '09:30', status: 'present' },
  { id: 'a3', user_id: 'u4', date: '2026-03-08', status: 'absent' },
  { id: 'a4', user_id: 'u5', date: '2026-03-08', check_in: '08:55', check_out: '18:00', status: 'present' },
  { id: 'a5', user_id: 'u6', date: '2026-03-08', check_in: '10:15', status: 'late' },
  { id: 'a6', user_id: 'u7', date: '2026-03-08', check_in: '09:00', check_out: '13:00', status: 'half-day' },
  { id: 'a7', user_id: 'u8', date: '2026-03-08', check_in: '09:10', status: 'present' },
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'l1', user_id: 'u2', user_name: 'Priya Sharma', leave_type: 'casual', start_date: '2026-03-10', end_date: '2026-03-11', reason: 'Family function', status: 'pending', created_at: '2026-03-07' },
  { id: 'l2', user_id: 'u4', user_name: 'Sneha Reddy', leave_type: 'sick', start_date: '2026-03-08', end_date: '2026-03-08', reason: 'Not feeling well', status: 'approved', created_at: '2026-03-07' },
  { id: 'l3', user_id: 'u7', user_name: 'Karan Mehta', leave_type: 'annual', start_date: '2026-03-15', end_date: '2026-03-20', reason: 'Vacation', status: 'pending', created_at: '2026-03-06' },
  { id: 'l4', user_id: 'u3', user_name: 'Amit Patel', leave_type: 'casual', start_date: '2026-02-20', end_date: '2026-02-21', reason: 'Personal work', status: 'approved', created_at: '2026-02-18' },
  { id: 'l5', user_id: 'u6', user_name: 'Anita Desai', leave_type: 'sick', start_date: '2026-02-25', end_date: '2026-02-26', reason: 'Doctor appointment', status: 'rejected', created_at: '2026-02-24' },
];

export const payrollRecords: PayrollRecord[] = [
  { id: 'p1', user_id: 'u2', user_name: 'Priya Sharma', month: '2026-02', base_salary: 85000, bonus: 5000, deductions: 8500, net_salary: 81500 },
  { id: 'p2', user_id: 'u3', user_name: 'Amit Patel', month: '2026-02', base_salary: 72000, bonus: 3000, deductions: 7200, net_salary: 67800 },
  { id: 'p3', user_id: 'u4', user_name: 'Sneha Reddy', month: '2026-02', base_salary: 55000, bonus: 2000, deductions: 5500, net_salary: 51500 },
  { id: 'p4', user_id: 'u5', user_name: 'Vikram Singh', month: '2026-02', base_salary: 68000, bonus: 4000, deductions: 6800, net_salary: 65200 },
  { id: 'p5', user_id: 'u6', user_name: 'Anita Desai', month: '2026-02', base_salary: 60000, bonus: 2500, deductions: 6000, net_salary: 56500 },
  { id: 'p6', user_id: 'u7', user_name: 'Karan Mehta', month: '2026-02', base_salary: 45000, bonus: 1000, deductions: 4500, net_salary: 41500 },
  { id: 'p7', user_id: 'u8', user_name: 'Deepa Nair', month: '2026-02', base_salary: 40000, bonus: 1500, deductions: 4000, net_salary: 37500 },
];

export const activityLogs: ActivityLog[] = [
  { id: 'act1', action: 'Checked in', user_name: 'Priya Sharma', timestamp: '2026-03-08 09:02' },
  { id: 'act2', action: 'Leave approved', user_name: 'Sneha Reddy', timestamp: '2026-03-07 16:30' },
  { id: 'act3', action: 'New order created: Website Redesign', user_name: 'Rajesh Kumar', timestamp: '2026-03-07 14:00' },
  { id: 'act4', action: 'Order completed: Brand Identity Package', user_name: 'Amit Patel', timestamp: '2026-03-06 17:30' },
  { id: 'act5', action: 'New customer added: Raj Construction', user_name: 'System', timestamp: '2026-03-05 10:00' },
  { id: 'act6', action: 'Payroll generated for Feb', user_name: 'System', timestamp: '2026-03-01 00:00' },
  { id: 'act7', action: 'Leave applied', user_name: 'Priya Sharma', timestamp: '2026-03-07 14:20' },
];

export const monthlyAttendance = [
  { month: 'Oct', present: 85, absent: 10, late: 5 },
  { month: 'Nov', present: 88, absent: 8, late: 4 },
  { month: 'Dec', present: 80, absent: 15, late: 5 },
  { month: 'Jan', present: 90, absent: 6, late: 4 },
  { month: 'Feb', present: 87, absent: 9, late: 4 },
  { month: 'Mar', present: 82, absent: 12, late: 6 },
];

export const departmentBreakdown = [
  { name: 'Engineering', count: 3 },
  { name: 'Marketing', count: 2 },
  { name: 'Sales', count: 1 },
  { name: 'HR', count: 1 },
  { name: 'Finance', count: 1 },
];

export const monthlyRevenue = [
  { month: 'Oct', revenue: 380000, orders: 4 },
  { month: 'Nov', revenue: 520000, orders: 6 },
  { month: 'Dec', revenue: 290000, orders: 3 },
  { month: 'Jan', revenue: 610000, orders: 5 },
  { month: 'Feb', revenue: 450000, orders: 7 },
  { month: 'Mar', revenue: 695000, orders: 4 },
];

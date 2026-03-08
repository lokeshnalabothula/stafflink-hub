
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'worker');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  department TEXT,
  position TEXT,
  salary NUMERIC DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  address TEXT,
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create OTP verification table
CREATE TABLE public.otp_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIME,
  check_out TIME,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half-day')),
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create leaves table
CREATE TABLE public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'annual', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  company TEXT,
  address TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES public.customers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline DATE,
  amount NUMERIC DEFAULT 0,
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can manage all profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'owner'));

-- OTP table: service role only (accessed from edge functions)
CREATE POLICY "Service role only" ON public.otp_verification FOR ALL USING (false);

-- Departments: anyone authenticated can read
CREATE POLICY "Authenticated can read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage departments" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Attendance policies: owners manage, workers view own
CREATE POLICY "Workers view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners manage all attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Leaves policies
CREATE POLICY "Workers view own leaves" ON public.leaves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Workers can apply for leave" ON public.leaves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners manage all leaves" ON public.leaves FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Customers policies
CREATE POLICY "Authenticated can read customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners manage customers" ON public.customers FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Orders policies
CREATE POLICY "Workers view assigned orders" ON public.orders FOR SELECT USING (auth.uid() = ANY(assigned_to));
CREATE POLICY "Owners manage all orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Payroll policies
CREATE POLICY "Workers view own payroll" ON public.payroll FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners manage payroll" ON public.payroll FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

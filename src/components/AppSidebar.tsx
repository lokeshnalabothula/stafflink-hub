import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, Users, Clock, CalendarOff, Wallet, FileText, User, LogOut, ShoppingCart, UserCircle
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const ownerLinks = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Orders', url: '/orders', icon: ShoppingCart },
  { title: 'Customers', url: '/customers', icon: UserCircle },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Attendance', url: '/attendance', icon: Clock },
  { title: 'Leaves', url: '/leaves', icon: CalendarOff },
  { title: 'Payroll', url: '/payroll', icon: Wallet },
  { title: 'Reports', url: '/reports', icon: FileText },
];

const workerLinks = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Orders', url: '/orders', icon: ShoppingCart },
  { title: 'My Attendance', url: '/attendance', icon: Clock },
  { title: 'My Leaves', url: '/leaves', icon: CalendarOff },
  { title: 'My Salary', url: '/payroll', icon: Wallet },
  { title: 'Profile', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const links = user?.role === 'owner' ? ownerLinks : workerLinks;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-4 pb-4 mb-2 border-b border-sidebar-border">
            <h1 className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
              StaffHub
            </h1>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              Staff Management
            </p>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent/40 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

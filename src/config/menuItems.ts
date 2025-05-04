import { IconType } from 'react-icons';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineLightningBolt,
  HiOutlineChat,
  HiOutlineCog
} from 'react-icons/hi';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: IconType;
  permission?: string; // Permission required to see this item
  children?: MenuItem[]; // For nested menu items
  badge?: {
    text: string;
    color: string;
  };
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: HiOutlineHome,
    permission: 'dashboard:read',
  },
  {
    id: 'hrm',
    title: 'Human Resources',
    path: '/hrm',
    icon: HiOutlineUsers,
    permission: 'employee:read',
    children: [
      {
        id: 'employees',
        title: 'Employees',
        path: '/hrm/employees',
        icon: HiOutlineUsers,
        permission: 'employee:read',
      },
      {
        id: 'skills',
        title: 'Skills Management',
        path: '/hrm/skills',
        icon: HiOutlineLightningBolt,
        permission: 'employee-skill:read',
      },
    ],
  },
  {
    id: 'margin',
    title: 'Margin',
    path: '/margin',
    icon: HiOutlineCurrencyDollar,
    permission: 'margin:read',
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    path: '/opportunities',
    icon: HiOutlineLightningBolt,
    permission: 'opportunity:read',
  },
  {
    id: 'contracts',
    title: 'Contracts',
    path: '/contracts',
    icon: HiOutlineDocumentText,
    permission: 'contract:read',
  },
  {
    id: 'reports',
    title: 'Reports',
    path: '/reports',
    icon: HiOutlineChat,
    permission: 'report:read',
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: HiOutlineCog,
    permission: 'config:read',
  },
]; 
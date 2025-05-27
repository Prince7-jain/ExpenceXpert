
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import ThemeSwitcher from './ThemeSwitcher';

const UserMenu = () => {
  const { data: session } = useSession();
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleSettingsClick = () => {
    // Navigate to the settings tab
    if (window.setActiveTab) {
      window.setActiveTab('settings');
    }
  };

  const handleProfileClick = () => {
    // Navigate to the profile tab
    if (window.setActiveTab) {
      window.setActiveTab('profile');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <ThemeSwitcher />
      
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || 'No email'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;

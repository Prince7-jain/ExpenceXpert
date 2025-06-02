import React, { ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, PieChart, BarChart, CircleDollarSign, Calendar, Plus, Settings, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import UserMenu from "@/components/UserMenu";
import NewTransactionDialog from "@/components/NewTransactionDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Add this to global Window interface
declare global {
  interface Window {
    setActiveTab: (tab: string) => void;
  }
}

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <div 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </div>
);

type HeaderIconProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const HeaderIcon = ({ icon: Icon, label, active, onClick }: HeaderIconProps) => (
  <div 
    className={cn(
      "flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span className="text-xs mt-1">{label}</span>
  </div>
);

type DashboardLayoutProps = {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

const DashboardLayout = ({ children, activeTab = "dashboard", onTabChange }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
  
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Expose setActiveTab to window for use in other components
  useEffect(() => {
    window.setActiveTab = (tab: string) => {
      if (onTabChange) {
        onTabChange(tab);
      }
    };

    return () => {
      delete window.setActiveTab;
    };
  }, [onTabChange]);

  const handleMobileNewTransaction = () => {
    setIsMobileDialogOpen(true);
  };

  const sidebarContent = (
    <div className="space-y-1">
      <SidebarItem 
        icon={Home} 
        label="Dashboard" 
        active={activeTab === "dashboard"} 
        onClick={() => handleTabClick("dashboard")} 
      />
      <SidebarItem 
        icon={CircleDollarSign} 
        label="Transactions" 
        active={activeTab === "transactions"} 
        onClick={() => handleTabClick("transactions")} 
      />
      <SidebarItem 
        icon={PieChart} 
        label="Categories" 
        active={activeTab === "categories"} 
        onClick={() => handleTabClick("categories")} 
      />
      <SidebarItem 
        icon={BarChart} 
        label="Reports" 
        active={activeTab === "reports"} 
        onClick={() => handleTabClick("reports")} 
      />
      <SidebarItem 
        icon={Calendar} 
        label="Budget" 
        active={activeTab === "budget"} 
        onClick={() => handleTabClick("budget")} 
      />
      <SidebarItem 
        icon={Settings} 
        label="Settings" 
        active={activeTab === "settings"} 
        onClick={() => handleTabClick("settings")} 
      />
      <SidebarItem 
        icon={User} 
        label="Profile" 
        active={activeTab === "profile"} 
        onClick={() => handleTabClick("profile")} 
      />
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && (
          <Sidebar className="border-r">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-primary">ExpanceXpert</h1>
              <p className="text-sm text-muted-foreground">Personal Finance Tracker</p>
            </div>
            <SidebarContent className="p-2">
              {sidebarContent}
            </SidebarContent>
            <div className="mt-auto p-4 border-t">
              <NewTransactionDialog />
            </div>
          </Sidebar>
        )}
        
        <div className="flex-1 flex flex-col">
          <header className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <div className="p-4 border-b">
                      <h1 className="text-xl font-bold text-primary">ExpanceXpert</h1>
                      <p className="text-sm text-muted-foreground">Personal Finance Tracker</p>
                    </div>
                    <div className="p-4">
                      {sidebarContent}
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <SidebarTrigger />
              )}
              <h2 className="font-semibold">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "transactions" && "Transactions"}
                {activeTab === "categories" && "Categories"}
                {activeTab === "reports" && "Reports"}
                {activeTab === "budget" && "Budget"}
                {activeTab === "settings" && "Settings"}
                {activeTab === "profile" && "Profile"}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleMobileNewTransaction}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              )}
              <UserMenu />
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile NewTransactionDialog */}
      {isMobile && (
        <NewTransactionDialog 
          triggerOpen={isMobileDialogOpen}
          onOpenChange={setIsMobileDialogOpen}
        />
      )}
    </SidebarProvider>
  );
};

export default DashboardLayout;

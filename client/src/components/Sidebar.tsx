import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  CheckSquare, 
  Building2, 
  Users, 
  BookOpen,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Default to employee if role is missing
  // @ts-ignore - Assuming role exists on user object
  const role = user?.role || 'employee';

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ['employee', 'manager', 'finance', 'admin'] },
    { href: "/my-expenses", label: "My Expenses", icon: Receipt, roles: ['employee', 'manager', 'finance', 'admin'] },
    { href: "/submit", label: "Submit Claim", icon: PlusCircle, roles: ['employee', 'manager', 'finance', 'admin'] },
    { href: "/approvals", label: "Approvals", icon: CheckSquare, roles: ['manager', 'finance', 'admin'] },
    { href: "/ledger", label: "Ledger", icon: BookOpen, roles: ['finance', 'admin'] },
    { href: "/companies", label: "Companies", icon: Building2, roles: ['admin'] },
    { href: "/users", label: "Users", icon: Users, roles: ['admin'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(role));

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-none">Expensify</h1>
          <p className="text-xs text-slate-400">Enterprise Claims</p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {filteredLinks.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? "bg-blue-600/20 text-blue-400 shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-white/5"}
            `}>
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <img 
            src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} 
            alt="Profile" 
            className="w-8 h-8 rounded-full bg-slate-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{role}</p>
          </div>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-r-slate-800">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="ml-3 font-semibold text-lg">Expensify</div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-slate-900">
        <NavContent />
      </aside>
    </>
  );
}

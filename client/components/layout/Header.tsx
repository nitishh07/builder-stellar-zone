import { Link, useLocation } from "react-router-dom";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
};

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Student Risk Monitoring & Counselling System home">
            <div className="size-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm" />
            <span className="hidden text-sm font-extrabold tracking-tight text-foreground sm:inline">Student Risk Monitoring</span>
          </Link>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/config">Rule Config</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => toast.success("No new notifications")}
          >
            <Bell className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="size-7">
                  <AvatarFallback>MN</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">Mentor Name</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="size-4" />
                Signed in as
                <span className="ml-auto font-semibold">mentor@example.com</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/config" className="flex items-center gap-2">
                  <Settings className="size-4" /> Admin Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("Logged out (prototype)")}> 
                <LogOut className="mr-2 size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

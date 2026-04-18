import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, LayoutDashboard, ShieldCheck, Flame } from "lucide-react";

const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
        isActive ? "text-primary" : "text-muted-foreground"
    }`;

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2" data-testid="brand-home-link">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-black">
                        A
                    </div>
                    <span className="font-display text-lg font-bold tracking-tight">ExamAce</span>
                </Link>

                {user ? (
                    <nav className="hidden items-center gap-8 md:flex">
                        <NavLink to="/dashboard" className={navClass} data-testid="nav-dashboard">Dashboard</NavLink>
                        <NavLink to="/practice" className={navClass} data-testid="nav-practice">Daily Practice</NavLink>
                        <NavLink to="/exams" className={navClass} data-testid="nav-exams">Mock Tests</NavLink>
                        <NavLink to="/analytics" className={navClass} data-testid="nav-analytics">Analytics</NavLink>
                        <NavLink to="/doubt" className={navClass} data-testid="nav-doubt">Ask AI</NavLink>
                        {user.role === "admin" && (
                            <NavLink to="/admin" className={navClass} data-testid="nav-admin">Admin</NavLink>
                        )}
                    </nav>
                ) : (
                    <nav className="hidden items-center gap-8 md:flex">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary">Features</a>
                        <a href="#exams" className="text-sm font-medium text-muted-foreground hover:text-primary">Exams</a>
                    </nav>
                )}

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {typeof user.streak === "number" && user.streak > 0 && (
                                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent" data-testid="user-streak-badge">
                                    <Flame className="h-3.5 w-3.5" />
                                    {user.streak} day streak
                                </div>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2" data-testid="user-menu-trigger">
                                        <UserIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{user.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                        {user.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard">
                                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                                    </DropdownMenuItem>
                                    {user.role === "admin" && (
                                        <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} data-testid="nav-login-btn">
                                Log in
                            </Button>
                            <Button size="sm" onClick={() => navigate("/signup")} data-testid="nav-signup-btn">
                                Get started
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

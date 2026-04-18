import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email.trim(), password);
        setLoading(false);
        if (res.ok) {
            toast.success(`Welcome back, ${res.user.name}`);
            const dest = location.state?.from || (res.user.role === "admin" ? "/admin" : "/dashboard");
            navigate(dest, { replace: true });
        } else {
            toast.error(res.error);
        }
    };

    const fillDemo = () => {
        setEmail("student@examace.com");
        setPassword("student123");
    };

    return (
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <div className="overline mb-2">Welcome back</div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Log in to ExamAce</h1>
            <p className="text-muted-foreground mb-8">Jump back to your prep ritual.</p>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        data-testid="login-email-input"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        data-testid="login-password-input"
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log in
                </Button>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm">
                <div className="overline mb-2">Demo credentials</div>
                <div className="font-mono text-xs text-muted-foreground">student@examace.com · student123</div>
                <Button type="button" variant="ghost" size="sm" className="mt-2 h-auto px-2 py-1" onClick={fillDemo} data-testid="login-fill-demo-btn">
                    Use demo account
                </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
                New to ExamAce?{" "}
                <Link to="/signup" className="font-medium text-primary hover:underline" data-testid="login-signup-link">
                    Create an account
                </Link>
            </p>
        </div>
    );
}

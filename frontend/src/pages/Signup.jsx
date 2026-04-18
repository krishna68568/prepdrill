import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        const res = await register(name.trim(), email.trim(), password);
        setLoading(false);
        if (res.ok) {
            toast.success("Account created — let's begin!");
            navigate("/dashboard", { replace: true });
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <div className="overline mb-2">Get started</div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Create your ExamAce account</h1>
            <p className="text-muted-foreground mb-8">Free forever for core practice and 3 mock tests per month.</p>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
                <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required data-testid="signup-name-input" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="signup-email-input" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} data-testid="signup-password-input" />
                    <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-btn">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline" data-testid="signup-login-link">
                    Log in
                </Link>
            </p>
        </div>
    );
}

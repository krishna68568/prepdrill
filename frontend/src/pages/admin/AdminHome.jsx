import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, FileQuestion, ClipboardList, ArrowRight } from "lucide-react";

export default function AdminHome() {
    const [stats, setStats] = useState({});

    useEffect(() => {
        api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    }, []);

    const cards = [
        { label: "Users", value: stats.users, icon: Users, link: "/admin/users", testid: "admin-card-users" },
        { label: "Questions", value: stats.questions, icon: BookOpen, link: "/admin/questions", testid: "admin-card-questions" },
        { label: "Mock tests", value: stats.mock_tests, icon: FileQuestion, link: "/admin/tests", testid: "admin-card-tests" },
        { label: "Total attempts", value: stats.attempts, icon: ClipboardList, link: "/admin/users", testid: "admin-card-attempts" },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="overline mb-2">Admin</div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" data-testid="admin-heading">Control room</h1>
                <p className="text-muted-foreground mt-2">Manage questions, tests, and users for ExamAce.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((c) => (
                    <Card key={c.label} className="border-border transition-all hover:-translate-y-1 hover:shadow-md" data-testid={c.testid}>
                        <Link to={c.link}>
                            <CardContent className="p-6">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary mb-4">
                                    <c.icon className="h-4 w-4" />
                                </div>
                                <div className="overline mb-1">{c.label}</div>
                                <div className="font-display text-3xl font-bold">{c.value ?? "—"}</div>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border"><CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">Manage questions</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add, edit, or delete the MCQ bank used across practice and mocks.</p>
                    <Button asChild size="sm" data-testid="manage-questions-btn"><Link to="/admin/questions">Open <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">Manage mock tests</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create timer-based tests by selecting questions.</p>
                    <Button asChild size="sm" data-testid="manage-tests-btn"><Link to="/admin/tests">Open <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">User activity</h3>
                    <p className="text-sm text-muted-foreground mb-4">Review signups, attempts, and mock test submissions.</p>
                    <Button asChild size="sm" data-testid="manage-users-btn"><Link to="/admin/users">Open <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
                </CardContent></Card>
            </div>
        </div>
    );
}

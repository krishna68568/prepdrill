import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, BookOpen, Timer, Sparkles, ArrowRight, Target } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

function StatCard({ icon: Icon, label, value, sub, testid }) {
    return (
        <Card className="border-border" data-testid={testid}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="overline mb-1">{label}</div>
                <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
                {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { user, refresh } = useAuth();
    const [perf, setPerf] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [p, r] = await Promise.all([
                    api.get("/performance/me").then((x) => x.data),
                    api.get("/results/me").then((x) => x.data),
                ]);
                setPerf(p);
                setResults(r);
                refresh();
            } catch (e) {
                // ignore
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const trend = (perf?.trend || []).map((t, i) => ({ ...t, idx: i + 1 }));

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="overline mb-2">Welcome back</div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" data-testid="dashboard-greeting">
                        Hi, {user?.name?.split(" ")[0] || "Aspirant"}.
                    </h1>
                    <p className="text-muted-foreground mt-2">Here's your prep snapshot. Pick a drill and go.</p>
                </div>
                <Button asChild size="lg" className="gap-2" data-testid="cta-practice-btn">
                    <Link to="/practice">
                        Start daily practice <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Flame} label="Current streak" value={`${perf?.streak ?? user?.streak ?? 0}`} sub="days in a row" testid="stat-streak" />
                <StatCard icon={Target} label="Accuracy" value={`${perf?.accuracy ?? 0}%`} sub={`${perf?.correct ?? 0}/${perf?.total_attempts ?? 0} correct`} testid="stat-accuracy" />
                <StatCard icon={Timer} label="Tests taken" value={`${perf?.tests_taken ?? 0}`} sub="mock tests completed" testid="stat-tests" />
                <StatCard icon={BookOpen} label="Questions solved" value={`${perf?.total_attempts ?? 0}`} sub="total attempts" testid="stat-attempts" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <Card className="lg:col-span-2 border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="overline mb-1">Accuracy trend</div>
                                <div className="font-display text-xl font-semibold">Your mock test progress</div>
                            </div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {trend.length > 0 ? (
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                                            formatter={(v) => [`${v}%`, "Accuracy"]}
                                            labelFormatter={(l) => `Test #${l}`}
                                        />
                                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                                Take a mock test to see your accuracy trend.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground border-primary" data-testid="daily-practice-cta">
                    <CardContent className="p-6">
                        <div className="overline mb-3 text-primary-foreground/70">Today's drill</div>
                        <h3 className="font-display text-2xl font-bold mb-3">Sharpen your edge in under 10 minutes.</h3>
                        <p className="text-sm text-primary-foreground/80 mb-6">
                            Six daily questions across SSC, CAT, and GATE with AI explanations for every answer.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="secondary" size="sm" data-testid="dashboard-practice-btn">
                                <Link to="/practice"><Sparkles className="mr-2 h-3.5 w-3.5" /> Practice now</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" data-testid="dashboard-mocktest-btn">
                                <Link to="/exams">Browse mock tests</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="overline mb-3">Recent results</div>
                    {results.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No test results yet. <Link to="/exams" className="text-primary font-medium">Take your first mock</Link>.</p>
                    ) : (
                        <ul className="divide-y divide-border" data-testid="recent-results-list">
                            {results.slice(0, 5).map((r) => (
                                <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                                    <div>
                                        <div className="font-medium">{r.title}</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                            {new Date(r.created_at).toLocaleString()} · {r.exam}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-mono font-bold">{r.score}/{r.total}</div>
                                            <div className="text-xs text-muted-foreground">{r.accuracy}%</div>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/result/${r.id}`}>Review</Link>
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

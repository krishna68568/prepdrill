import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, TrendingUp, AlertTriangle, ThumbsUp } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
} from "recharts";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Analytics() {
    const [perf, setPerf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [loadingFb, setLoadingFb] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/performance/me");
                setPerf(data);
            } catch (e) {
                toast.error(formatApiError(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const generate = async () => {
        setLoadingFb(true);
        try {
            const { data } = await api.post("/performance/feedback");
            setFeedback(data.feedback);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoadingFb(false);
        }
    };

    if (loading || !perf) {
        return <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    const trendData = perf.trend.map((t, i) => ({ name: `#${i + 1}`, accuracy: t.accuracy }));
    const topicData = perf.topics.map((t) => ({ name: t.name, accuracy: t.accuracy }));

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="overline mb-2">Performance analytics</div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" data-testid="analytics-heading">Know your shape.</h1>
                <p className="text-muted-foreground mt-2">Metrics that tell you what to drill next.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card><CardContent className="p-5"><div className="overline mb-1">Accuracy</div><div className="font-display text-2xl font-bold" data-testid="analytics-accuracy">{perf.accuracy}%</div></CardContent></Card>
                <Card><CardContent className="p-5"><div className="overline mb-1">Attempts</div><div className="font-display text-2xl font-bold" data-testid="analytics-attempts">{perf.total_attempts}</div></CardContent></Card>
                <Card><CardContent className="p-5"><div className="overline mb-1">Tests taken</div><div className="font-display text-2xl font-bold">{perf.tests_taken}</div></CardContent></Card>
                <Card><CardContent className="p-5"><div className="overline mb-1">Streak</div><div className="font-display text-2xl font-bold">{perf.streak} days</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <Card><CardContent className="p-6">
                    <div className="overline mb-3 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Accuracy trend</div>
                    {trendData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-10 text-center">Take a mock test to unlock your accuracy trend.</p>
                    )}
                </CardContent></Card>

                <Card><CardContent className="p-6">
                    <div className="overline mb-3">Topic strength</div>
                    {topicData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={110} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-10 text-center">Attempt questions to see topic strengths.</p>
                    )}
                </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <Card className="border-destructive/30">
                    <CardContent className="p-6">
                        <div className="overline mb-3 flex items-center gap-2 text-destructive/80"><AlertTriangle className="h-3.5 w-3.5" /> Weak topics</div>
                        {perf.weak_topics.length > 0 ? (
                            <ul className="space-y-3">
                                {perf.weak_topics.map((t) => (
                                    <li key={t.name} data-testid={`weak-${t.name}`}>
                                        <div className="flex justify-between text-sm mb-1"><span className="font-medium">{t.name}</span><span className="font-mono text-muted-foreground">{t.accuracy}%</span></div>
                                        <Progress value={t.accuracy} className="h-1" />
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">No weak topics detected. Keep practicing!</p>}
                    </CardContent>
                </Card>
                <Card className="border-success/30">
                    <CardContent className="p-6">
                        <div className="overline mb-3 flex items-center gap-2 text-success"><ThumbsUp className="h-3.5 w-3.5" /> Strong topics</div>
                        {perf.strong_topics.length > 0 ? (
                            <ul className="space-y-3">
                                {perf.strong_topics.map((t) => (
                                    <li key={t.name} data-testid={`strong-${t.name}`}>
                                        <div className="flex justify-between text-sm mb-1"><span className="font-medium">{t.name}</span><span className="font-mono text-muted-foreground">{t.accuracy}%</span></div>
                                        <Progress value={t.accuracy} className="h-1" />
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">Attempt more questions to unlock strong topics.</p>}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-l-4 border-l-accent bg-secondary">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 overline"><Sparkles className="h-3.5 w-3.5 text-accent" /> AI Coach feedback</div>
                        {!feedback && (
                            <Button onClick={generate} disabled={loadingFb} size="sm" data-testid="generate-analytics-feedback-btn">
                                {loadingFb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate feedback
                            </Button>
                        )}
                    </div>
                    {feedback ? (
                        <div className="prose-ace text-sm leading-relaxed" data-testid="analytics-feedback-text">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Get a personalized study plan powered by AI — tailored to your weak topics.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

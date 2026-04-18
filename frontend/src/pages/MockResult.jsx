import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Sparkles, Loader2, ArrowLeft, Minus } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const letters = ["A", "B", "C", "D"];

export default function MockResult() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [loadingFb, setLoadingFb] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/results/${id}`);
                setResult(data);
            } catch (e) {
                toast.error(formatApiError(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const getFeedback = async () => {
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

    if (loading || !result) {
        return (
            <div className="py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const mins = Math.floor(result.time_taken_seconds / 60);
    const secs = result.time_taken_seconds % 60;

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" size="sm" className="mb-4" data-testid="back-to-exams-btn">
                <Link to="/exams"><ArrowLeft className="mr-1 h-4 w-4" /> Back to mock tests</Link>
            </Button>

            <div className="mb-8">
                <div className="overline mb-2">Test result</div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" data-testid="result-title">{result.title}</h1>
                <p className="text-muted-foreground mt-1">{result.exam} · {new Date(result.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-border"><CardContent className="p-6">
                    <div className="overline mb-1">Score</div>
                    <div className="font-display text-3xl font-bold" data-testid="result-score">{result.score}<span className="text-muted-foreground text-xl">/{result.total}</span></div>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-6">
                    <div className="overline mb-1">Accuracy</div>
                    <div className="font-display text-3xl font-bold" data-testid="result-accuracy">{result.accuracy}%</div>
                    <Progress value={result.accuracy} className="mt-3 h-1.5" />
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-6">
                    <div className="overline mb-1">Correct / Wrong</div>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-success font-bold"><CheckCircle2 className="h-4 w-4" /> {result.correct}</div>
                        <div className="flex items-center gap-1 text-destructive font-bold"><XCircle className="h-4 w-4" /> {result.wrong}</div>
                        <div className="flex items-center gap-1 text-muted-foreground font-bold"><Minus className="h-4 w-4" /> {result.unattempted}</div>
                    </div>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-6">
                    <div className="overline mb-1">Time taken</div>
                    <div className="font-display text-3xl font-bold flex items-center gap-1"><Clock className="h-5 w-5 text-muted-foreground" /> <span className="font-mono">{mins}m {secs}s</span></div>
                </CardContent></Card>
            </div>

            {/* Topic breakdown */}
            <Card className="border-border mb-8">
                <CardContent className="p-6">
                    <div className="overline mb-3">Topic breakdown</div>
                    <div className="space-y-4">
                        {Object.entries(result.topic_breakdown).map(([topic, s]) => (
                            <div key={topic} data-testid={`topic-${topic}`}>
                                <div className="flex items-center justify-between mb-1.5 text-sm">
                                    <span className="font-medium">{topic}</span>
                                    <span className="font-mono text-muted-foreground">{s.correct}/{s.total} · {s.accuracy}%</span>
                                </div>
                                <Progress value={s.accuracy} className="h-1.5" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Feedback */}
            <Card className="border-l-4 border-l-accent border-border bg-secondary mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <span className="overline">AI personalized feedback</span>
                        </div>
                        {!feedback && (
                            <Button onClick={getFeedback} disabled={loadingFb} size="sm" variant="default" data-testid="get-feedback-btn">
                                {loadingFb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate feedback
                            </Button>
                        )}
                    </div>
                    {feedback ? (
                        <div className="prose-ace text-sm leading-relaxed text-secondary-foreground" data-testid="feedback-text">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Click "Generate feedback" for a personalized study plan based on all your attempts across practice and mocks.</p>
                    )}
                </CardContent>
            </Card>

            {/* Question review */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="overline mb-4">Question review</div>
                    <ul className="space-y-6">
                        {result.question_review.map((r, i) => (
                            <li key={r.question_id} className="border-b border-border pb-6 last:border-0 last:pb-0" data-testid={`review-${i}`}>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">Q{i + 1}</span>
                                    <Badge variant="outline" className="text-xs">{r.topic}</Badge>
                                    {r.unattempted ? (
                                        <Badge className="bg-muted text-muted-foreground text-xs">Unattempted</Badge>
                                    ) : r.is_correct ? (
                                        <Badge className="bg-success text-success-foreground text-xs">Correct</Badge>
                                    ) : (
                                        <Badge className="bg-destructive text-destructive-foreground text-xs">Wrong</Badge>
                                    )}
                                </div>
                                <p className="text-base font-medium mb-3">{r.text}</p>
                                <div className="space-y-1.5 text-sm">
                                    {r.options.map((o, idx) => {
                                        const isCorrect = idx === r.correct_index;
                                        const isSelected = idx === r.selected_index;
                                        let cls = "text-muted-foreground";
                                        if (isCorrect) cls = "text-success font-medium";
                                        else if (isSelected && !isCorrect) cls = "text-destructive font-medium line-through";
                                        return (
                                            <div key={idx} className={cls}>
                                                <span className="font-mono font-bold mr-2">{letters[idx]}.</span>
                                                {o}
                                                {isCorrect && <span className="ml-2 text-xs">✓ correct</span>}
                                                {isSelected && !isCorrect && <span className="ml-2 text-xs">✗ your answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

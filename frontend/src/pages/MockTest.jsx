import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "sonner";

const letters = ["A", "B", "C", "D"];

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MockTest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // {qid: selected_index}
    const [marked, setMarked] = useState({}); // {qid: true}
    const [remaining, setRemaining] = useState(0);
    const [startedAt, setStartedAt] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const timerRef = useRef(null);
    const submitRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/mock-tests/${id}/start`);
                setTest(data);
                setRemaining(data.duration_minutes * 60);
                setStartedAt(Date.now());
            } catch (e) {
                toast.error(formatApiError(e));
                navigate("/exams");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, navigate]);

    // Timer
    useEffect(() => {
        if (!test) return;
        timerRef.current = setInterval(() => {
            setRemaining((s) => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    submitRef.current?.(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [test]);

    const questions = test?.questions || [];
    const current = questions[idx];

    const stats = useMemo(() => {
        const attempted = Object.keys(answers).length;
        const markedCount = Object.values(marked).filter(Boolean).length;
        return {
            attempted,
            marked: markedCount,
            unattempted: questions.length - attempted,
        };
    }, [answers, marked, questions.length]);

    const handleSubmit = async (auto = false) => { // eslint-disable-line no-use-before-define
        if (submitting) return;
        setSubmitting(true);
        clearInterval(timerRef.current);
        const timeTaken = Math.floor((Date.now() - startedAt) / 1000);
        try {
            const { data } = await api.post(`/mock-tests/${id}/submit`, {
                answers,
                time_taken_seconds: timeTaken,
            });
            toast.success(auto ? "Time up — auto-submitted" : "Test submitted");
            navigate(`/result/${data.id}`);
        } catch (e) {
            toast.error(formatApiError(e));
            setSubmitting(false);
        }
    };

    // Keep a ref to the latest handleSubmit so the timer can call it without stale closure issues.
    submitRef.current = handleSubmit;

    if (loading || !test || !current) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const select = (i) => setAnswers((a) => ({ ...a, [current.id]: i }));
    const toggleMark = () => setMarked((m) => ({ ...m, [current.id]: !m[current.id] }));
    const clearCurrent = () =>
        setAnswers((a) => {
            const { [current.id]: _, ...rest } = a;
            return rest;
        });

    const statusFor = (q) => {
        const answered = answers[q.id] !== undefined;
        const m = !!marked[q.id];
        if (answered && m) return "answered-marked";
        if (answered) return "answered";
        if (m) return "marked";
        return "unattempted";
    };

    const paletteClass = (q, i) => {
        const s = statusFor(q);
        const current = i === idx;
        let base = "h-10 w-10 rounded-md text-sm font-mono font-bold flex items-center justify-center transition-all";
        if (current) base += " ring-2 ring-accent ring-offset-2";
        if (s === "answered") return `${base} bg-success text-success-foreground`;
        if (s === "marked") return `${base} bg-warning text-warning-foreground`;
        if (s === "answered-marked") return `${base} bg-warning text-warning-foreground border-2 border-success`;
        return `${base} bg-muted text-muted-foreground hover:bg-muted/70`;
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <Badge variant="outline">{test.exam}</Badge>
                    <h1 className="font-display font-semibold text-sm sm:text-base">{test.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${remaining < 60 ? "text-destructive" : "text-primary"}`} data-testid="mock-timer">
                        {formatTime(remaining)}
                    </div>
                    <Button onClick={() => setShowSubmit(true)} size="sm" data-testid="open-submit-modal-btn">
                        <Send className="mr-2 h-3.5 w-3.5" /> Submit test
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Question panel */}
                <div className="lg:col-span-8 overflow-auto nice-scroll p-4 sm:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="overline">Question {idx + 1} / {questions.length}</span>
                            <Badge variant="outline" className="capitalize">{current.topic}</Badge>
                            <Badge className="capitalize bg-muted text-muted-foreground">{current.difficulty}</Badge>
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold leading-snug mb-6" data-testid="mock-question-text">
                            {current.text}
                        </h2>
                        <div className="space-y-3">
                            {current.options.map((o, i) => {
                                const chosen = answers[current.id] === i;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => select(i)}
                                        className={`flex items-start gap-4 w-full text-left rounded-md border p-4 transition-all active:scale-[0.99] ${
                                            chosen ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }`}
                                        data-testid={`mock-option-${i}`}
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/30 font-mono text-sm font-bold">
                                            {letters[i]}
                                        </span>
                                        <span className="pt-1.5">{o}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                                disabled={idx === 0}
                                data-testid="mock-prev-btn"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </Button>
                            <Button
                                variant={marked[current.id] ? "secondary" : "outline"}
                                size="sm"
                                onClick={toggleMark}
                                data-testid="mock-mark-btn"
                            >
                                <Flag className="mr-2 h-3.5 w-3.5" />
                                {marked[current.id] ? "Unmark review" : "Mark for review"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={clearCurrent} data-testid="mock-clear-btn">
                                Clear response
                            </Button>
                            <Button
                                size="sm"
                                className="ml-auto"
                                onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
                                disabled={idx === questions.length - 1}
                                data-testid="mock-next-btn"
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Palette */}
                <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-auto nice-scroll p-4 sm:p-6">
                    <div className="overline mb-3">Question palette</div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2 mb-6">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setIdx(i)}
                                className={paletteClass(q, i)}
                                data-testid={`palette-${i + 1}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 text-xs">
                        <LegendRow color="bg-success" label={`Attempted (${stats.attempted})`} />
                        <LegendRow color="bg-warning" label={`Marked for review (${stats.marked})`} />
                        <LegendRow color="bg-muted" label={`Unattempted (${stats.unattempted})`} />
                    </div>
                </aside>
            </div>

            <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit your test?</DialogTitle>
                        <DialogDescription>
                            You've answered <span className="font-mono font-semibold">{stats.attempted}</span> of{" "}
                            <span className="font-mono font-semibold">{questions.length}</span> questions.
                            {stats.unattempted > 0 && (
                                <span> {stats.unattempted} are still unanswered.</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmit(false)} data-testid="submit-cancel-btn">
                            Keep solving
                        </Button>
                        <Button onClick={() => handleSubmit(false)} disabled={submitting} data-testid="submit-confirm-btn">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LegendRow({ color, label }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
            {label}
        </div>
    );
}

import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const FILTERS = ["All", "SSC", "CAT", "GATE"];

export default function Practice() {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [exam, setExam] = useState("All");
    const [index, setIndex] = useState(0);
    const [answered, setAnswered] = useState(0);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const params = exam === "All" ? {} : { exam };
                const { data } = await api.get("/questions/daily", { params });
                setQuestions(data);
                setIndex(0);
                setAnswered(0);
            } catch (e) {
                toast.error(formatApiError(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [exam]);

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                <div className="mt-3 text-sm text-muted-foreground">Loading today's drills…</div>
            </div>
        );
    }

    const q = questions[index];

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <div className="mb-8">
                <div className="overline mb-2">Daily practice</div>
                <h1 className="font-display text-3xl font-bold tracking-tight mb-3" data-testid="practice-heading">Six questions. Infinite clarity.</h1>
                <p className="text-muted-foreground">Submit, then tap <span className="font-semibold text-foreground">Explain with AI</span> to unlock the reasoning.</p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                    {FILTERS.map((f) => (
                        <Button
                            key={f}
                            variant={exam === f ? "default" : "outline"}
                            size="sm"
                            onClick={() => setExam(f)}
                            data-testid={`filter-${f}`}
                        >
                            {f}
                        </Button>
                    ))}
                    <Badge variant="secondary" className="ml-auto">
                        {answered} / {questions.length} attempted
                    </Badge>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground" data-testid="practice-empty">
                    No daily questions for {exam} right now. Try another category.
                </div>
            ) : (
                <>
                    <QuestionCard
                        key={q.id}
                        question={q}
                        index={index}
                        total={questions.length}
                        onAnswered={() => setAnswered((a) => a + 1)}
                    />

                    <div className="mt-6 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setIndex((i) => Math.max(0, i - 1))}
                            disabled={index === 0}
                            data-testid="practice-prev-btn"
                        >
                            Previous
                        </Button>
                        <div className="font-mono text-sm text-muted-foreground">
                            {index + 1} / {questions.length}
                        </div>
                        <Button
                            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                            disabled={index === questions.length - 1}
                            data-testid="practice-next-btn"
                        >
                            Next question
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

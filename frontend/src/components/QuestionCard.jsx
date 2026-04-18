import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, formatApiError } from "@/lib/api";
import { Sparkles, Wand2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const letters = ["A", "B", "C", "D"];

function optionClasses({ idx, selected, submitted, correct }) {
    const base =
        "group flex items-start gap-4 w-full text-left rounded-md border p-4 transition-all duration-200 active:scale-[0.99]";
    if (!submitted) {
        return `${base} ${
            selected === idx
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`;
    }
    if (idx === correct) return `${base} border-success bg-success/10 text-success`;
    if (selected === idx && idx !== correct)
        return `${base} border-destructive bg-destructive/10 text-destructive`;
    return `${base} border-border opacity-60`;
}

export default function QuestionCard({ question, index, total, onAnswered }) {
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [loadingExp, setLoadingExp] = useState(false);
    const [similar, setSimilar] = useState(null);
    const [loadingSim, setLoadingSim] = useState(false);

    const submit = async () => {
        if (selected == null) return;
        setSubmitting(true);
        try {
            const { data } = await api.post("/attempts", {
                question_id: question.id,
                selected_index: selected,
            });
            setResult(data);
            setSubmitted(true);
            onAnswered?.(data);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSubmitting(false);
        }
    };

    const loadExplanation = async () => {
        setLoadingExp(true);
        try {
            const { data } = await api.get(`/questions/${question.id}/explain`);
            setExplanation(data);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoadingExp(false);
        }
    };

    const loadSimilar = async () => {
        setLoadingSim(true);
        try {
            const { data } = await api.post(`/questions/${question.id}/similar`);
            setSimilar(data);
            toast.success("Generated a similar question");
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoadingSim(false);
        }
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8" data-testid={`question-card-${question.id}`}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {typeof index === "number" && (
                        <span className="overline">
                            Question {index + 1}
                            {total ? ` / ${total}` : ""}
                        </span>
                    )}
                    <Badge variant="outline" className="capitalize">
                        {question.topic}
                    </Badge>
                    <Badge
                        className={`capitalize ${
                            question.difficulty === "easy"
                                ? "bg-success/15 text-success"
                                : question.difficulty === "hard"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/15 text-warning"
                        }`}
                    >
                        {question.difficulty}
                    </Badge>
                </div>
                {submitted && result && (
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${result.is_correct ? "text-success" : "text-destructive"}`} data-testid="result-indicator">
                        {result.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {result.is_correct ? "Correct" : "Incorrect"}
                    </div>
                )}
            </div>

            <h3 className="text-xl font-display font-semibold leading-snug mb-6" data-testid="question-text">
                {question.text}
            </h3>

            <div className="space-y-3">
                {question.options.map((opt, i) => (
                    <button
                        key={i}
                        type="button"
                        disabled={submitted}
                        onClick={() => !submitted && setSelected(i)}
                        className={optionClasses({
                            idx: i,
                            selected,
                            submitted,
                            correct: result?.correct_index,
                        })}
                        data-testid={`option-${question.id}-${letters[i]}`}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/30 font-mono text-sm font-bold">
                            {letters[i]}
                        </span>
                        <span className="pt-1.5 text-base">{opt}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                {!submitted ? (
                    <Button
                        onClick={submit}
                        disabled={selected == null || submitting}
                        data-testid="submit-answer-btn"
                        className="min-w-32"
                    >
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit answer
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={loadExplanation}
                            disabled={loadingExp || explanation}
                            data-testid="explain-btn"
                            className="gap-2"
                        >
                            {loadingExp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
                            {explanation ? "Explanation shown" : "Explain with AI"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={loadSimilar}
                            disabled={loadingSim}
                            data-testid="similar-btn"
                            className="gap-2"
                        >
                            {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            Generate similar
                        </Button>
                    </>
                )}
            </div>

            <AnimatePresence>
                {explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 rounded-lg border-l-4 border-accent bg-secondary p-6" data-testid="ai-explanation-block">
                            <div className="overline mb-3 flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5" /> AI Explanation
                            </div>
                            {explanation.explanation && (
                                <div className="prose-ace text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
                                    {explanation.explanation}
                                </div>
                            )}
                            {explanation.trick && (
                                <div className="mt-4 rounded-md bg-card/70 p-3">
                                    <div className="overline mb-1 text-accent/80">Short Trick</div>
                                    <div className="font-mono text-sm">{explanation.trick}</div>
                                </div>
                            )}
                            {explanation.concept && (
                                <div className="mt-4 text-sm text-muted-foreground italic">
                                    Concept: {explanation.concept}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {similar && (
                <div className="mt-6 rounded-lg border border-dashed border-accent/50 bg-accent/5 p-5" data-testid="similar-question-block">
                    <div className="overline mb-2 text-accent">Similar question (AI-generated)</div>
                    <p className="text-base font-medium mb-3">{similar.text}</p>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                        {similar.options?.map((o, i) => (
                            <li key={i}>
                                <span className="font-mono font-bold text-primary">{letters[i]}.</span> {o}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

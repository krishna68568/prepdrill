import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATS = ["All", "SSC", "CAT", "GATE", "Railways", "Police", "REET"];

export default function Exams() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cat, setCat] = useState("All");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const params = cat === "All" ? {} : { exam: cat };
                const { data } = await api.get("/mock-tests", { params });
                setTests(data);
            } catch (e) {
                toast.error(formatApiError(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [cat]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="overline mb-2">Mock tests</div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" data-testid="exams-heading">Full-length practice. Real pressure.</h1>
                <p className="text-muted-foreground mt-2">Timer-based. Instant results. AI-powered feedback when you submit.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {CATS.map((c) => (
                        <Button
                            key={c}
                            variant={cat === c ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCat(c)}
                            data-testid={`exam-filter-${c}`}
                        >
                            {c}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </div>
            ) : tests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground" data-testid="exams-empty">
                    No mock tests available for {cat} yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests.map((t) => (
                        <Card key={t.id} className="border-border transition-all hover:-translate-y-1 hover:shadow-md" data-testid={`mocktest-card-${t.id}`}>
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline">{t.exam}</Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                        <Clock className="h-3.5 w-3.5" /> {t.duration_minutes} min
                                    </div>
                                </div>
                                <h3 className="font-display text-lg font-semibold leading-snug mb-2">{t.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{t.description}</p>
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                        <FileQuestion className="h-3.5 w-3.5" /> {t.total_marks} questions
                                    </div>
                                    <Button asChild size="sm" data-testid={`start-test-btn-${t.id}`}>
                                        <Link to={`/test/${t.id}`}>
                                            Start <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

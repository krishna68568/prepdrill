import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
    exam: "SSC",
    topic: "",
    difficulty: "medium",
    text: "",
    options: ["", "", "", ""],
    correct_index: 0,
    is_daily: false,
};

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const params = filter === "All" ? {} : { exam: filter };
            const { data } = await api.get("/questions", { params });
            setQuestions(data);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY);
        setOpen(true);
    };

    const openEdit = (q) => {
        setEditing(q);
        setForm({
            exam: q.exam,
            topic: q.topic,
            difficulty: q.difficulty,
            text: q.text,
            options: [...q.options],
            correct_index: q.correct_index,
            is_daily: !!q.is_daily,
        });
        setOpen(true);
    };

    const save = async () => {
        if (!form.text.trim() || form.options.some((o) => !o.trim())) {
            toast.error("Fill question text and all 4 options");
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/questions/${editing.id}`, form);
                toast.success("Question updated");
            } else {
                await api.post("/questions", form);
                toast.success("Question created");
            }
            setOpen(false);
            await load();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (q) => {
        if (!window.confirm(`Delete this question?\n\n"${q.text.slice(0, 80)}..."`)) return;
        try {
            await api.delete(`/questions/${q.id}`);
            toast.success("Deleted");
            await load();
        } catch (e) {
            toast.error(formatApiError(e));
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="overline mb-2">Admin · Questions</div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Question bank</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32" data-testid="admin-questions-filter"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {["All", "SSC", "CAT", "GATE", "Railways", "Police", "REET"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={openNew} data-testid="admin-new-question-btn">
                        <Plus className="mr-2 h-4 w-4" /> New question
                    </Button>
                </div>
            </div>

            <Card><CardContent className="p-0">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
                ) : (
                    <div className="divide-y divide-border" data-testid="admin-questions-list">
                        {questions.map((q) => (
                            <div key={q.id} className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Badge variant="outline">{q.exam}</Badge>
                                        <Badge variant="secondary">{q.topic}</Badge>
                                        <Badge className="capitalize bg-muted text-muted-foreground">{q.difficulty}</Badge>
                                        {q.is_daily && <Badge className="bg-accent text-accent-foreground">Daily</Badge>}
                                    </div>
                                    <div className="text-sm font-medium leading-snug">{q.text}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)} data-testid={`edit-q-${q.id}`}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => remove(q)} data-testid={`delete-q-${q.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <div className="p-10 text-center text-sm text-muted-foreground">No questions yet.</div>
                        )}
                    </div>
                )}
            </CardContent></Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit question" : "New question"}</DialogTitle>
                        <DialogDescription>Configure a multiple-choice question.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Exam</Label>
                                <Select value={form.exam} onValueChange={(v) => setForm({ ...form, exam: v })}>
                                    <SelectTrigger data-testid="form-exam"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SSC">SSC</SelectItem>
                                        <SelectItem value="CAT">CAT</SelectItem>
                                        <SelectItem value="GATE">GATE</SelectItem>
                                        <SelectItem value="Railways">Railways</SelectItem>
                                        <SelectItem value="Police">Police</SelectItem>
                                        <SelectItem value="REET">REET</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Difficulty</Label>
                                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                                    <SelectTrigger data-testid="form-difficulty"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">easy</SelectItem>
                                        <SelectItem value="medium">medium</SelectItem>
                                        <SelectItem value="hard">hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Topic</Label>
                                <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} data-testid="form-topic" />
                            </div>
                        </div>
                        <div>
                            <Label>Question text</Label>
                            <Textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} data-testid="form-text" />
                        </div>
                        <div className="space-y-2">
                            <Label>Options (pick correct answer)</Label>
                            {form.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, correct_index: i })}
                                        className={`h-8 w-8 shrink-0 rounded-md font-mono font-bold text-sm ${
                                            form.correct_index === i ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                                        }`}
                                        data-testid={`form-correct-${i}`}
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </button>
                                    <Input
                                        value={opt}
                                        onChange={(e) => {
                                            const options = [...form.options];
                                            options[i] = e.target.value;
                                            setForm({ ...form, options });
                                        }}
                                        data-testid={`form-option-${i}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div>
                                <Label>Daily practice</Label>
                                <p className="text-xs text-muted-foreground">Include this in the daily question feed.</p>
                            </div>
                            <Switch checked={form.is_daily} onCheckedChange={(v) => setForm({ ...form, is_daily: v })} data-testid="form-is-daily" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={saving} data-testid="form-save-btn">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
    title: "",
    exam: "SSC",
    description: "",
    question_ids: [],
    duration_minutes: 20,
};

export default function AdminTests() {
    const [tests, setTests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [t, q] = await Promise.all([
                api.get("/mock-tests").then((r) => r.data),
                api.get("/questions").then((r) => r.data),
            ]);
            setTests(t);
            setQuestions(q);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY);
        setOpen(true);
    };
    const openEdit = (t) => {
        setEditing(t);
        setForm({
            title: t.title,
            exam: t.exam,
            description: t.description,
            question_ids: [...t.question_ids],
            duration_minutes: t.duration_minutes,
        });
        setOpen(true);
    };

    const save = async () => {
        if (!form.title.trim() || form.question_ids.length === 0) {
            toast.error("Title and at least one question required");
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/mock-tests/${editing.id}`, form);
                toast.success("Test updated");
            } else {
                await api.post("/mock-tests", form);
                toast.success("Test created");
            }
            setOpen(false);
            await load();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (t) => {
        if (!window.confirm(`Delete test "${t.title}"?`)) return;
        try {
            await api.delete(`/mock-tests/${t.id}`);
            toast.success("Deleted");
            await load();
        } catch (e) {
            toast.error(formatApiError(e));
        }
    };

    const toggleQ = (id) => {
        setForm((f) => ({
            ...f,
            question_ids: f.question_ids.includes(id)
                ? f.question_ids.filter((x) => x !== id)
                : [...f.question_ids, id],
        }));
    };

    const filteredQs = questions.filter((q) => q.exam === form.exam);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="overline mb-2">Admin · Mock tests</div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Mock test builder</h1>
                </div>
                <Button onClick={openNew} data-testid="admin-new-test-btn">
                    <Plus className="mr-2 h-4 w-4" /> New mock test
                </Button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="admin-tests-list">
                    {tests.map((t) => (
                        <Card key={t.id} className="border-border">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline">{t.exam}</Badge>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)} data-testid={`edit-test-${t.id}`}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => remove(t)} data-testid={`delete-test-${t.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                                <h3 className="font-display text-lg font-semibold mb-2">{t.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                                <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                                    <span>{t.total_marks} questions</span>
                                    <span>{t.duration_minutes} min</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit mock test" : "New mock test"}</DialogTitle>
                        <DialogDescription>Pick questions from the bank and set a duration.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Title</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="test-form-title" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Exam</Label>
                                    <Select value={form.exam} onValueChange={(v) => setForm({ ...form, exam: v, question_ids: [] })}>
                                        <SelectTrigger data-testid="test-form-exam"><SelectValue /></SelectTrigger>
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
                                    <Label>Duration (min)</Label>
                                    <Input type="number" min={1} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value || "0", 10) })} data-testid="test-form-duration" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="test-form-desc" />
                        </div>
                        <div>
                            <Label>Questions ({form.question_ids.length} selected)</Label>
                            <div className="mt-2 max-h-80 overflow-auto nice-scroll rounded-md border border-border divide-y divide-border">
                                {filteredQs.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">No questions in the {form.exam} bank.</div>
                                ) : (
                                    filteredQs.map((q) => (
                                        <label key={q.id} className="flex items-start gap-3 p-3 hover:bg-muted/40 cursor-pointer">
                                            <Checkbox
                                                checked={form.question_ids.includes(q.id)}
                                                onCheckedChange={() => toggleQ(q.id)}
                                                data-testid={`test-form-q-${q.id}`}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="secondary" className="text-[10px]">{q.topic}</Badge>
                                                    <Badge className="text-[10px] bg-muted text-muted-foreground capitalize">{q.difficulty}</Badge>
                                                </div>
                                                <div className="text-sm">{q.text}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={saving} data-testid="test-form-save-btn">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

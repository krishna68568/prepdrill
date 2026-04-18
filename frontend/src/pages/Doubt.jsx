import { useEffect, useRef, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function Doubt() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setMessages((m) => [...m, { role: "user", text }]);
        setInput("");
        setSending(true);
        try {
            const { data } = await api.post("/doubt/ask", { question: text, session_id: sessionId });
            setSessionId(data.session_id);
            setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSending(false);
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const suggestions = [
        "Explain simple vs compound interest with an example",
        "What is time complexity and why does it matter?",
        "Give me 3 quick tips for CAT Reading Comprehension",
    ];

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
            <div className="mb-6">
                <div className="overline mb-2">Ask AI</div>
                <h1 className="font-display text-3xl font-bold tracking-tight" data-testid="doubt-heading">Doubt? Ask your AI coach.</h1>
                <p className="text-muted-foreground mt-2">Ask anything about SSC, CAT, or GATE topics. In English or Hindi.</p>
            </div>

            <Card className="flex-1 flex flex-col border-border">
                <CardContent className="flex-1 overflow-auto nice-scroll p-6 space-y-4" data-testid="doubt-messages">
                    {messages.length === 0 ? (
                        <div className="py-10 text-center">
                            <Sparkles className="mx-auto h-8 w-8 text-accent mb-3" />
                            <p className="text-muted-foreground mb-6">Try one of these to get started:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestions.map((s) => (
                                    <Button key={s} variant="outline" size="sm" onClick={() => setInput(s)} data-testid={`doubt-suggestion-${s.slice(0, 10)}`}>
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`} data-testid={`doubt-msg-${i}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/10 text-accent"}`}>
                                    {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`rounded-lg px-4 py-3 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))
                    )}
                    {sending && (
                        <div className="flex items-start gap-3" data-testid="doubt-typing">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-lg px-4 py-3 bg-secondary text-secondary-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Thinking…
                            </div>
                        </div>
                    )}
                    <div ref={endRef} />
                </CardContent>

                <div className="border-t border-border p-4 bg-card">
                    <div className="flex items-end gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKey}
                            placeholder="Type your doubt… (Shift + Enter for newline)"
                            className="resize-none min-h-[56px]"
                            data-testid="doubt-input"
                        />
                        <Button onClick={send} disabled={!input.trim() || sending} data-testid="doubt-send-btn" className="h-14">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

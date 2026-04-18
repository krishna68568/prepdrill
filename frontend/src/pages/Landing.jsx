import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
    BookOpen,
    Sparkles,
    Timer,
    LineChart,
    MessageCircle,
    GraduationCap,
    ArrowRight,
} from "lucide-react";

const EXAMS = [
    { slug: "SSC", title: "SSC", desc: "Combined Graduate Level, CHSL, MTS and more — bite-sized daily drills in Quant, Reasoning, English & GA.", stat: "20+ questions" },
    { slug: "CAT", title: "CAT", desc: "Quant, Verbal, and LR-DI for MBA aspirants with AI-powered concept breakdowns and shortcuts.", stat: "Updated daily" },
    { slug: "GATE", title: "GATE", desc: "Computer Science core: Algorithms, OS, DBMS, Networks — practice with solution-by-solution clarity.", stat: "30+ topics" },
];

const FEATURES = [
    { icon: BookOpen, title: "Daily practice", body: "A curated set of questions every day across Quant, Verbal, Reasoning and GA. Build the habit." },
    { icon: Sparkles, title: "AI explanations", body: "After each answer, get a step-by-step breakdown, a short trick, and a concept summary — in seconds." },
    { icon: Timer, title: "Timed mock tests", body: "Full-length, timer-based tests with question-palette navigation and instant scoring." },
    { icon: LineChart, title: "Smart analytics", body: "See accuracy trends, weak topics, and get AI-generated feedback tuned to your learning curve." },
    { icon: MessageCircle, title: "Ask AI doubts", body: "Stuck on a concept? Ask ExamAce in plain English or Hindi. Answers in seconds." },
    { icon: GraduationCap, title: "Built for SSC, CAT, GATE", body: "Content framework mirrors the exam patterns that matter most in India today." },
];

export default function Landing() {
    const { user } = useAuth();
    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border">
                <div className="grain absolute inset-0 opacity-60 pointer-events-none" />
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-28">
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="overline mb-4" data-testid="hero-tagline">SSC · CAT · GATE</div>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                            Crack the exam.
                            <br />
                            <span className="text-accent">One smart drill at a time.</span>
                        </h1>
                        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mb-8">
                            ExamAce is an AI-first prep platform. Solve a question, get a step-by-step explanation,
                            a short trick, and a concept refresher — then measure progress with timed mocks and
                            personalized feedback.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg" className="h-12 px-7" data-testid="hero-cta-signup">
                                <Link to={user ? "/dashboard" : "/signup"}>
                                    {user ? "Go to dashboard" : "Start practicing free"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-12 px-7" data-testid="hero-cta-exams">
                                <Link to={user ? "/exams" : "/login"}>
                                    {user ? "Browse mock tests" : "I already have an account"}
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-10 flex items-center gap-8 text-sm">
                            <div><span className="font-mono text-xl font-bold">30+</span><span className="ml-2 text-muted-foreground">sample questions</span></div>
                            <div><span className="font-mono text-xl font-bold">3</span><span className="ml-2 text-muted-foreground">full mock tests</span></div>
                            <div><span className="font-mono text-xl font-bold">AI</span><span className="ml-2 text-muted-foreground">powered</span></div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                        <div className="aspect-[4/5] w-full rounded-lg overflow-hidden border border-border bg-secondary relative">
                            <img
                                src="https://images.unsplash.com/photo-1758525861622-f4e7ac86a2d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxleGFtJTIwcHJlcGFyYXRpb258ZW58MHx8fHwxNzc2NTMxOTY1fDA&ixlib=rb-4.1.0&q=85"
                                alt="Student preparing for exam"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4 right-4 rounded-md bg-card/95 backdrop-blur p-4 border border-border">
                                <div className="overline mb-1">Today's drill</div>
                                <div className="text-sm font-medium leading-snug">"A sum doubles in 8 years at simple interest. In how many years will it become 5 times?"</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mb-12">
                        <div className="overline mb-3">How it works</div>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            Practice with feedback loops that compound.
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Every attempt is a lesson. Every mock is a map of what to do next.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f) => (
                            <Card key={f.title} className="border-border transition-all hover:-translate-y-1 hover:shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mb-4">
                                        <f.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Exam bento */}
            <section id="exams" className="border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <div className="overline mb-3">Exam categories</div>
                            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                                Start where you are headed.
                            </h2>
                        </div>
                        <Button asChild variant="outline" data-testid="see-all-exams-btn">
                            <Link to={user ? "/exams" : "/signup"}>See all mock tests <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {EXAMS.map((e, idx) => (
                            <Card key={e.slug} className={`border-border ${idx === 1 ? "bg-primary text-primary-foreground" : ""}`} data-testid={`exam-card-${e.slug}`}>
                                <CardContent className="p-8">
                                    <div className={`overline mb-4 ${idx === 1 ? "text-primary-foreground/70" : ""}`}>{e.stat}</div>
                                    <h3 className="font-display text-4xl font-black tracking-tight mb-3">{e.title}</h3>
                                    <p className={`text-sm leading-relaxed mb-6 ${idx === 1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{e.desc}</p>
                                    <Button
                                        asChild
                                        variant={idx === 1 ? "secondary" : "outline"}
                                        size="sm"
                                        data-testid={`exam-cta-${e.slug}`}
                                    >
                                        <Link to={user ? "/exams" : "/signup"}>
                                            Explore {e.title} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-primary text-primary-foreground">
                <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-6">
                        Your next rank starts with <span className="text-accent">one question</span>.
                    </h2>
                    <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                        Sign up free and get your first AI-powered explanation in under a minute.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="h-12 px-8" data-testid="final-cta-signup">
                        <Link to={user ? "/dashboard" : "/signup"}>
                            {user ? "Continue to dashboard" : "Create your free account"}
                        </Link>
                    </Button>
                </div>
            </section>

            <footer className="border-t border-border">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div>© {new Date().getFullYear()} ExamAce. Built for aspirants.</div>
                    <div className="font-mono text-xs">SSC · CAT · GATE</div>
                </div>
            </footer>
        </div>
    );
}

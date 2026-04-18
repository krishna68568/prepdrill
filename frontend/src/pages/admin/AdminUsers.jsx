import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/admin/users");
                setUsers(data);
            } catch (e) {
                toast.error(formatApiError(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="overline mb-2">Admin · Users</div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Users & activity</h1>
            </div>

            <Card className="border-border"><CardContent className="p-0">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
                ) : (
                    <div className="overflow-auto nice-scroll">
                        <table className="w-full text-sm" data-testid="admin-users-table">
                            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-right font-mono">Attempts</th>
                                    <th className="px-4 py-3 text-right font-mono">Tests</th>
                                    <th className="px-4 py-3 text-right font-mono">Streak</th>
                                    <th className="px-4 py-3 text-left">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/20" data-testid={`user-row-${u.id}`}>
                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <Badge className={u.role === "admin" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{u.attempts}</td>
                                        <td className="px-4 py-3 text-right font-mono">{u.tests}</td>
                                        <td className="px-4 py-3 text-right font-mono">{u.streak ?? 0}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.created_at?.slice(0, 10)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent></Card>
        </div>
    );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit2,
  Trash2,
  Bell,
  Send,
} from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/useAuth";
import { createAdminAlert } from "@/lib/notifications";

interface AdminNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  profiles?: {
    email: string;
    name: string | null;
  };
}

export const NotificationManager = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [editingNotif, setEditingNotif] = useState<AdminNotification | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

    // Alert state
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [isSendingAlert, setIsSendingAlert] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    const {
        page,
        setPage,
        pageSize,
        canNext,
        canPrev,
        totalPages,
        nextPage,
        prevPage,
    } = usePagination({ pageSize: 10, totalItems: totalCount });

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const { count, error: countError } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("type", "admin_alert");

            if (countError) throw countError;
            setTotalCount(count || 0);

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data: notificationsData, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("type", "admin_alert")
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;

            const userIds = [...new Set((notificationsData as any[]).map((n) => n.user_id))];
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("user_id, email, name")
                .in("user_id", userIds);

            const profilesMap: Record<string, { email: string; name: string | null }> = {};
            profilesData?.forEach((p) => {
                profilesMap[p.user_id] = { email: p.email, name: p.name };
            });

            const joinedNotifications = (notificationsData as any[]).map((n) => ({
                ...n,
                profiles: profilesMap[n.user_id],
            }));

            setNotifications(joinedNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTotalUsers = async () => {
        try {
            const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
            setTotalUsers(count || 0);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchNotifications();
        fetchTotalUsers();
    }, [page]);

    const handleSendAlert = async () => {
        if (!alertTitle.trim() || !alertMessage.trim()) {
            toast.error("Please fill in both title and message");
            return;
        }
        if (!user) return;

        setIsSendingAlert(true);
        const success = await createAdminAlert(
            user.id,
            alertTitle.trim(),
            alertMessage.trim()
        );
        setIsSendingAlert(false);

        if (success) {
            toast.success(`Alert sent to ${totalUsers} users!`);
            setAlertTitle("");
            setAlertMessage("");
            fetchNotifications(); // Refresh list to show new alerts
        } else {
            toast.error("Failed to send alert");
        }
    };

    const confirmDelete = (id: string) => {
        setNotificationToDelete(id);
    };

    const executeDelete = async () => {
        if (!notificationToDelete) return;

        try {
            const { error, count } = await supabase
                .from("notifications")
                .delete({ count: "exact" })
                .eq("id", notificationToDelete);

            if (error) throw error;
            if (count === 0) {
                throw new Error("No record deleted. You might not have permission (RLS Policy).");
            }
            toast.success("Notification deleted");
            fetchNotifications();
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        } finally {
            setNotificationToDelete(null);
        }
    };

    const handleUpdate = async () => {
        if (!editingNotif) return;
        try {
            const { error } = await supabase
                .from("notifications")
                .update({
                    title: editTitle,
                    message: editMessage,
                })
                .eq("id", editingNotif.id);

            if (error) throw error;
            toast.success("Notification updated");
            setEditingNotif(null);
            fetchNotifications();
        } catch (error) {
            console.error("Error updating notification:", error);
            toast.error("Failed to update notification");
        }
    };

    const openEdit = (notif: AdminNotification) => {
        setEditingNotif(notif);
        setEditTitle(notif.title);
        setEditMessage(notif.message);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 order-2 lg:order-1">
                <Card className="bg-card h-full">
                    <CardHeader>
                        <CardTitle>Manage Notifications</CardTitle>
                        <CardDescription>View and edit admin alerts sent to users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : notifications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No notifications found</TableCell>
                                    </TableRow>
                                ) : (
                                    notifications.map((n) => (
                                        <TableRow key={n.id}>
                                            <TableCell className="font-medium align-top py-4">{n.title}</TableCell>
                                            <TableCell className="align-top py-4 max-w-md">
                                                <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top py-4">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="align-top py-4">
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}>
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => confirmDelete(n.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                canPrev={canPrev}
                                canNext={canNext}
                                onPrev={prevPage}
                                onNext={nextPage}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
                <Card className="bg-card sticky top-6">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-lg">Send Alert</CardTitle>
                        </div>
                        <CardDescription>Broadcast to all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="alert-title">Title</Label>
                                <Input
                                    id="alert-title"
                                    placeholder="New Feature!"
                                    value={alertTitle}
                                    onChange={(e) => setAlertTitle(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="alert-message">Message</Label>
                                <Textarea
                                    id="alert-message"
                                    placeholder="Announcement..."
                                    value={alertMessage}
                                    onChange={(e) => setAlertMessage(e.target.value)}
                                    className="mt-1 min-h-[120px]"
                                />
                            </div>
                            <Button
                                onClick={handleSendAlert}
                                disabled={isSendingAlert || !alertTitle.trim() || !alertMessage.trim()}
                                className="w-full gap-2"
                            >
                                <Send className="h-4 w-4" />
                                {isSendingAlert ? "Sending..." : "Send Alert"}
                            </Button>
                            <div className="text-center">
                                <span className="text-xs text-muted-foreground">Targeting {totalUsers} users</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!editingNotif} onOpenChange={(open) => !open && setEditingNotif(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Notification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Title</Label>
                            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label>Message</Label>
                            <Textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setEditingNotif(null)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!notificationToDelete} onOpenChange={(open) => !open && setNotificationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the notification from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={executeDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

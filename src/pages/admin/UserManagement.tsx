import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Crown,
  Edit2,
  Coins,
  Save,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  credits?: number; // Fetched from user_credits
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, "admin" | "user">>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);

  // Credit editing
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newCreditAmount, setNewCreditAmount] = useState(0);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isSavingCredits, setIsSavingCredits] = useState(false);

  const {
    page,
    setPage,
    pageSize,
    range,
    canNext,
    canPrev,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination({ pageSize: 10, totalItems: totalUsers });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Count
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;
      setTotalUsers(count || 0);

      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(range.from, range.to);

      if (error) throw error;

      // Fetch Roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, "admin" | "user"> = {};
      rolesData?.forEach((r) => {
        rolesMap[r.user_id] = r.role as "admin" | "user";
      });
      setUserRoles(rolesMap);

      // Fetch Credits for these users
      const userIds = profiles.map((p) => p.user_id);
      const { data: creditsData } = await supabase
        .from("user_credits")
        .select("user_id, credits")
        .in("user_id", userIds);

      const creditsMap: Record<string, number> = {};
      creditsData?.forEach((c) => {
        creditsMap[c.user_id] = c.credits;
      });

      // Merge
      const mergedUsers = profiles.map((p) => ({
        ...p,
        credits: creditsMap[p.user_id] ?? 100, // Default to 100 if not found
      }));

      setUsers(mergedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }

      setUserRoles((prev) => ({ ...prev, [userId]: newRole }));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("User approved");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("User rejected");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to reject user");
    }
  };

  const handleEditCredits = (user: UserProfile) => {
    setSelectedUser(user);
    setNewCreditAmount(user.credits ?? 100);
    setIsCreditDialogOpen(true);
  };

  const saveCredits = async () => {
    if (!selectedUser) return;
    setIsSavingCredits(true);
    try {
      // Call the database function directly (same pattern as updateUserRole)
      const { error } = await supabase.rpc("update_user_credits", {
        target_user_id: selectedUser.user_id,
        new_amount: newCreditAmount,
      });

      if (error) {
        console.error("RPC error:", error);
        throw error;
      }

      toast.success("Credits updated successfully");
      setIsCreditDialogOpen(false);
      fetchUsers(); // Refresh to show new amount
    } catch (error) {
      console.error("Error saving credits:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update credits";
      toast.error(errorMessage);
    } finally {
      setIsSavingCredits(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && u.status === statusFilter;
  });

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage accounts, roles, and credit balances.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Waitlist</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{u.name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === "approved"
                          ? "default"
                          : u.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={userRoles[u.user_id] || "user"}
                      onValueChange={(value: "admin" | "user") =>
                        updateUserRole(u.user_id, value)
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2"> User</div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-yellow-500" /> Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Coins className="h-3.5 w-3.5 text-yellow-500" />
                      {u.credits}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveUser(u.user_id)}
                            className="h-8 text-xs gap-1"
                          >
                            <UserCheck className="h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectUser(u.user_id)}
                            className="h-8 text-xs gap-1"
                          >
                            <UserX className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCredits(u)}
                          className="h-8 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" /> Edit Credits
                        </Button>
                      )}
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

        {/* Edit Credits Dialog */}
        <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Credits</DialogTitle>
              <DialogDescription>
                Set credit balance for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">
                  Credits
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={newCreditAmount.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      // Allow empty intermediate state by setting to 0?
                      setNewCreditAmount(0);
                    } else {
                      setNewCreditAmount(parseInt(val));
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveCredits} disabled={isSavingCredits}>
                {isSavingCredits ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  Search,
  Edit2,
  Save,
  X,
  LogOut,
  Twitter,
  Linkedin,
  Instagram,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Crown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
  approved_at: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

interface UserLimit {
  id: string;
  user_id: string;
  platform: string;
  monthly_limit: number;
}

interface PlatformUsage {
  platform: string;
  readUsed: number;
  readLimit: number;
  readPercentage: number;
  writeUsed: number;
  writeLimit: number;
  writePercentage: number;
}

const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'threads'];

// Platform API limits (these are calculated by aggregating user usage)
// We track our own usage since we can't fetch from Twitter API dashboard
const PLATFORM_API_LIMITS = {
  twitter: {
    read: 100,      // Free tier: ~100 read requests per 15 min window
    write: 500,     // Free tier: 500 posts per month (corrected)
  },
  linkedin: {
    read: 10000,    // LinkedIn is more generous
    write: 10000,
  },
  instagram: {
    read: 5000,
    write: 5000,
  },
  facebook: {
    read: 10000,
    write: 10000,
  },
  threads: {
    read: 5000,
    write: 5000,
  },
};

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, 'admin' | 'user'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimit[]>([]);
  const [editingLimits, setEditingLimits] = useState<Record<string, number>>({});
  const [isLimitsDialogOpen, setIsLimitsDialogOpen] = useState(false);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage[]>([]);

  // Check if current user is admin
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      toast.error('Access denied. Admin only.');
    }
  }, [isAdmin, roleLoading, navigate]);

  // Fetch all users and platform usage
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchUserRoles();
      fetchPlatformUsage();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (error) throw error;
      
      const rolesMap: Record<string, 'admin' | 'user'> = {};
      (data || []).forEach((r: { user_id: string; role: string }) => {
        rolesMap[r.user_id] = r.role as 'admin' | 'user';
      });
      setUserRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Check if role record exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      setUserRoles(prev => ({ ...prev, [userId]: newRole }));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const fetchPlatformUsage = async () => {
    try {
      // Get current month
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Fetch all usage for current month (write operations = posts)
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('platform, posts_used')
        .eq('month_year', monthYear);

      if (usageError) throw usageError;

      // Aggregate write usage by platform
      const writeByPlatform: Record<string, number> = {};
      (usageData || []).forEach((row: { platform: string; posts_used: number }) => {
        writeByPlatform[row.platform] = (writeByPlatform[row.platform] || 0) + row.posts_used;
      });

      // For read operations, we'd need to track API calls separately
      // For now, we estimate based on connected accounts and feed fetches
      // In production, you'd have a separate table for API call tracking

      // Create platform usage array with read/write breakdown
      const usage: PlatformUsage[] = platforms.map(platform => {
        const limits = PLATFORM_API_LIMITS[platform as keyof typeof PLATFORM_API_LIMITS] || { read: 10000, write: 10000 };
        const writeUsed = writeByPlatform[platform] || 0;
        
        // Estimate read usage (in production, track this in a separate table)
        // For now, assume read is proportional to connected accounts
        const readUsed = 0; // Would come from api_calls tracking table

        return {
          platform,
          readUsed,
          readLimit: limits.read,
          readPercentage: limits.read > 0 ? Math.min((readUsed / limits.read) * 100, 100) : 0,
          writeUsed,
          writeLimit: limits.write,
          writePercentage: limits.write > 0 ? Math.min((writeUsed / limits.write) * 100, 100) : 0,
        };
      });

      setPlatformUsage(usage);
    } catch (error) {
      console.error('Error fetching platform usage:', error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('User rejected');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const openLimitsDialog = async (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setIsLimitsDialogOpen(true);

    const { data, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userProfile.user_id);

    if (error) {
      console.error('Error fetching limits:', error);
      return;
    }

    setUserLimits((data as UserLimit[]) || []);
    
    const limitsMap: Record<string, number> = {};
    (data as UserLimit[])?.forEach(limit => {
      limitsMap[limit.platform] = limit.monthly_limit;
    });
    platforms.forEach(p => {
      if (!limitsMap[p]) limitsMap[p] = 30;
    });
    setEditingLimits(limitsMap);
  };

  const saveLimits = async () => {
    if (!selectedUser) return;

    try {
      for (const platform of platforms) {
        const existingLimit = userLimits.find(l => l.platform === platform);
        
        if (existingLimit) {
          await supabase
            .from('user_limits')
            .update({ monthly_limit: editingLimits[platform] })
            .eq('id', existingLimit.id);
        } else {
          await supabase
            .from('user_limits')
            .insert({
              user_id: selectedUser.user_id,
              platform,
              monthly_limit: editingLimits[platform]
            });
        }
      }

      toast.success('Limits updated successfully');
      setIsLimitsDialogOpen(false);
    } catch (error) {
      console.error('Error saving limits:', error);
      toast.error('Failed to save limits');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  if (!isAdmin) {
    return null;
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform API Limits - Read/Write Breakdown */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Platform API Usage (This Month)</CardTitle>
            </div>
            <CardDescription>
              Monitor your app's usage against platform API limits. Usage is calculated from our database records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {platformUsage.map((usage) => (
                <div key={usage.platform} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {platformIcons[usage.platform] || <BarChart3 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-foreground">{usage.platform}</p>
                      <p className="text-xs text-muted-foreground">API Rate Limits</p>
                    </div>
                  </div>

                  {/* Read Operations */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Read Operations</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {usage.readUsed.toLocaleString()} / {usage.readLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={usage.readPercentage} 
                      className={`h-2 [&>div]:${getUsageColor(usage.readPercentage)}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {usage.readPercentage.toFixed(1)}% used
                    </p>
                  </div>

                  {/* Write Operations */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Write Operations</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {usage.writeUsed.toLocaleString()} / {usage.writeLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={usage.writePercentage} 
                      className={`h-2 [&>div]:${getUsageColor(usage.writePercentage)}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {usage.writePercentage.toFixed(1)}% used
                    </p>
                  </div>

                  {usage.platform === 'twitter' && (
                    <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        ⚠️ Free tier limits: {PLATFORM_API_LIMITS.twitter.read} reads, {PLATFORM_API_LIMITS.twitter.write} writes/month
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                How Usage is Tracked
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Write operations:</strong> Counted from posts in our database with status = 'posted'</li>
                <li>• <strong>Read operations:</strong> Would require separate API call tracking (not yet implemented)</li>
                <li>• <strong>Limits:</strong> Based on platform's free tier API quotas</li>
                <li>• We calculate usage by counting records, not by fetching from platform dashboards</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and their posting limits</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{u.name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            u.status === 'approved' ? 'default' :
                            u.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={userRoles[u.user_id] || 'user'}
                          onValueChange={(value: 'admin' | 'user') => updateUserRole(u.user_id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                User
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3 w-3 text-yellow-500" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveUser(u.user_id)}
                                className="gap-1"
                              >
                                <UserCheck className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUser(u.user_id)}
                                className="gap-1"
                              >
                                <UserX className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          {u.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openLimitsDialog(u)}
                              className="gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit Limits
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Limits Dialog */}
        <Dialog open={isLimitsDialogOpen} onOpenChange={setIsLimitsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Limits</DialogTitle>
              <DialogDescription>
                Set monthly posting limits for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {platformIcons[platform] || <BarChart3 className="h-4 w-4" />}
                    <Label className="capitalize">{platform}</Label>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={editingLimits[platform] || 30}
                    onChange={(e) => setEditingLimits({
                      ...editingLimits,
                      [platform]: parseInt(e.target.value) || 0
                    })}
                    className="w-24 text-right"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLimitsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveLimits}>
                <Save className="h-4 w-4 mr-2" />
                Save Limits
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

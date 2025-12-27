import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlatforms, PlatformType, ConnectedPlatform } from '@/hooks/usePlatforms';
import { useScheduleRules, ScheduleType, ScheduleRule } from '@/hooks/useScheduleRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Loader2, User, Save, Plus, Trash2, Clock, Calendar,
  Twitter, Linkedin, Instagram, Facebook, Youtube, Link, Unlink, Palette
} from 'lucide-react';
import { z } from 'zod';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const PLATFORM_CONFIG: Record<PlatformType, { name: string; icon: React.ElementType; color: string }> = {
  twitter: { name: 'Twitter / X', icon: Twitter, color: 'bg-[hsl(var(--twitter))]' },
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'bg-[hsl(var(--linkedin))]' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'bg-[hsl(var(--instagram))]' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
  threads: { name: 'Threads', icon: Instagram, color: 'bg-gray-900' },
  tiktok: { name: 'TikTok', icon: Instagram, color: 'bg-black' },
  pinterest: { name: 'Pinterest', icon: Instagram, color: 'bg-red-500' },
};

const nameSchema = z.string().trim().min(1, 'Name is required').max(100);

const PRIMARY_COLORS = [
  { value: '217 91% 60%', label: 'Blue', hex: '#3b82f6' },
  { value: '142 71% 45%', label: 'Green', hex: '#22c55e' },
  { value: '262 83% 58%', label: 'Purple', hex: '#8b5cf6' },
  { value: '340 75% 54%', label: 'Pink', hex: '#ec4899' },
  { value: '25 95% 53%', label: 'Orange', hex: '#f97316' },
  { value: '0 84% 60%', label: 'Red', hex: '#ef4444' },
  { value: '47 96% 53%', label: 'Yellow', hex: '#eab308' },
  { value: '173 80% 40%', label: 'Teal', hex: '#14b8a6' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading: authLoading, updateProfile, signOut } = useAuth();
  const { platforms, isLoading: platformsLoading, isConnecting, connectPlatform, disconnectPlatform } = usePlatforms();
  const { rules, isLoading: rulesLoading, createRule, updateRule, deleteRule, toggleRule } = useScheduleRules();
  
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isSaving, setIsSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('plingo-primary-color') || '217 91% 60%';
  });

  // Schedule rule form
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<ScheduleType>('daily');
  const [ruleTime, setRuleTime] = useState('09:00');
  const [ruleDays, setRuleDays] = useState<string[]>([]);

  // Apply primary color on mount and change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--ring', primaryColor);
    root.style.setProperty('--accent', primaryColor);
    root.style.setProperty('--scheduled', primaryColor);
    root.style.setProperty('--activity-bar-active', primaryColor);
    root.style.setProperty('--sidebar-primary', primaryColor);
    root.style.setProperty('--sidebar-ring', primaryColor);
  }, [primaryColor]);

  const handleColorChange = (colorValue: string) => {
    setPrimaryColor(colorValue);
    localStorage.setItem('plingo-primary-color', colorValue);
    toast({ title: 'Theme updated', description: 'Primary color has been changed.' });
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTimezone(profile.timezone || 'UTC');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      nameSchema.parse(name);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: err.errors[0].message, variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const { error } = await updateProfile({ name: name.trim(), timezone });
      if (error) throw error;
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateRule = async () => {
    if (!ruleTime) {
      toast({ title: 'Error', description: 'Please select a time', variant: 'destructive' });
      return;
    }

    if (ruleType === 'custom' && ruleDays.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one day', variant: 'destructive' });
      return;
    }

    const result = await createRule({
      name: ruleName || undefined,
      type: ruleType,
      time: ruleTime,
      days: ruleType === 'custom' ? ruleDays : undefined,
      timezone,
    });

    if (result) {
      setIsRuleDialogOpen(false);
      setRuleName('');
      setRuleType('daily');
      setRuleTime('09:00');
      setRuleDays([]);
    }
  };

  const toggleDay = (day: string) => {
    setRuleDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const formatRuleSchedule = (rule: ScheduleRule) => {
    const time = rule.time.slice(0, 5);
    switch (rule.type) {
      case 'daily': return `Every day at ${time}`;
      case 'weekdays': return `Weekdays at ${time}`;
      case 'weekends': return `Weekends at ${time}`;
      case 'custom': 
        const days = (rule.days || []).map(d => d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
        return `${days} at ${time}`;
      default: return time;
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {profile ? getInitials(profile.name, profile.email) : <User />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.name || 'No name set'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your app's primary color</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>Primary Color</Label>
              <div className="flex flex-wrap gap-3">
                {PRIMARY_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      primaryColor === color.value 
                        ? 'border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/20' 
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                    aria-label={`Set primary color to ${color.label}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {PRIMARY_COLORS.find(c => c.value === primaryColor)?.label || 'Custom'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Platforms */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Connected Platforms
            </CardTitle>
            <CardDescription>Manage your social media connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-3">
                {(['twitter', 'linkedin', 'instagram'] as PlatformType[]).map((platformKey) => {
                  const config = PLATFORM_CONFIG[platformKey];
                  const Icon = config.icon;
                  const connected = platforms.find(p => p.platform === platformKey && p.status === 'connected');

                  return (
                    <div key={platformKey} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${config.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{config.name}</p>
                          {connected && (
                            <p className="text-xs text-muted-foreground">
                              @{connected.platform_username || connected.platform_display_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {connected ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                              <Unlink className="h-3 w-3" />
                              Disconnect
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect {config.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You will no longer be able to post to this account until you reconnect.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => disconnectPlatform(connected.id)}>
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => connectPlatform(platformKey)}
                          disabled={isConnecting === platformKey}
                          className="gap-2"
                        >
                          {isConnecting === platformKey ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Rules */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Posting Schedule
                </CardTitle>
                <CardDescription>Set recurring times for bulk scheduling</CardDescription>
              </div>
              <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Posting Schedule</DialogTitle>
                    <DialogDescription>Set a recurring time for automatic post scheduling</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name (optional)</Label>
                      <Input 
                        placeholder="e.g., Morning post" 
                        value={ruleName} 
                        onChange={(e) => setRuleName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select value={ruleType} onValueChange={(v) => setRuleType(v as ScheduleType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Every day</SelectItem>
                          <SelectItem value="weekdays">Weekdays only</SelectItem>
                          <SelectItem value="weekends">Weekends only</SelectItem>
                          <SelectItem value="custom">Custom days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {ruleType === 'custom' && (
                      <div className="space-y-2">
                        <Label>Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={ruleDays.includes(day.value) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleDay(day.value)}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" value={ruleTime} onChange={(e) => setRuleTime(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateRule}>Create Schedule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No posting schedules yet</p>
                <p className="text-sm">Create a schedule to automate your posting times</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{rule.name || formatRuleSchedule(rule)}</p>
                        {rule.name && (
                          <p className="text-xs text-muted-foreground">{formatRuleSchedule(rule)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule.id)} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete schedule?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the posting schedule permanently.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRule(rule.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
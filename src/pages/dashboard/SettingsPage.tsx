import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Palette,
  CreditCard,
  Link2,
  Zap,
  ChevronRight,
  Check,
  LogOut,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
];

// Predefined theme colors (HSL format)
const themeColors = [
  { name: "Blue", value: "217 91% 60%", color: "hsl(217, 91%, 60%)" },
  { name: "Purple", value: "262 83% 58%", color: "hsl(262, 83%, 58%)" },
  { name: "Pink", value: "330 81% 60%", color: "hsl(330, 81%, 60%)" },
  { name: "Red", value: "0 84% 60%", color: "hsl(0, 84%, 60%)" },
  { name: "Orange", value: "25 95% 53%", color: "hsl(25, 95%, 53%)" },
  { name: "Yellow", value: "45 93% 47%", color: "hsl(45, 93%, 47%)" },
  { name: "Green", value: "142 76% 36%", color: "hsl(142, 76%, 36%)" },
  { name: "Teal", value: "173 80% 40%", color: "hsl(173, 80%, 40%)" },
  { name: "Cyan", value: "189 94% 43%", color: "hsl(189, 94%, 43%)" },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, setShowOnboarding } = useAppStore();
  const { profile, updateProfile, signOut } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [timezone, setTimezone] = useState(profile?.timezone || "UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [defaultPlatform, setDefaultPlatform] = useState<
    "twitter" | "linkedin"
  >("twitter");
  const [selectedColor, setSelectedColor] = useState("217 91% 60%");
  const [customColor, setCustomColor] = useState("#3b82f6");

  // Load saved color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem("plingo-primary-color");
    if (savedColor) {
      setSelectedColor(savedColor);
    }
  }, []);

  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined,
  ) => {
    if (name && name.length > 0) {
      return (
        name
          .split(" ")
          .map((n) => n[0] || "")
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U"
      );
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name, timezone });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const applyThemeColor = (hslValue: string) => {
    setSelectedColor(hslValue);
    localStorage.setItem("plingo-primary-color", hslValue);

    const root = document.documentElement;
    root.style.setProperty("--primary", hslValue);
    root.style.setProperty("--ring", hslValue);
    root.style.setProperty("--accent", hslValue);
    root.style.setProperty("--scheduled", hslValue);
    root.style.setProperty("--activity-bar-active", hslValue);
    root.style.setProperty("--sidebar-primary", hslValue);
    root.style.setProperty("--sidebar-ring", hslValue);

    toast.success("Theme color updated");
  };

  // Convert hex to HSL
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "217 91% 60%";

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
      l * 100,
    )}%`;
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    const hsl = hexToHsl(hex);
    applyThemeColor(hsl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Appearance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-border">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    alt={profile?.name || "User"}
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(profile?.name || null, profile?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {profile?.name || "No name set"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm">
                    Timezone
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} size="sm">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Use dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>

              <Separator />

              {/* Primary Color */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Primary Color</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose your accent color
                  </p>
                </div>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => applyThemeColor(color.value)}
                      className="group relative w-8 h-8 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                      style={{
                        backgroundColor: color.color,
                        boxShadow:
                          selectedColor === color.value
                            ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color.color}`
                            : undefined,
                      }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}

                  {/* Custom Color Picker */}
                  <div className="relative">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-border"
                      title="Custom color"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posting Preferences */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Posting</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="auto-schedule"
                    className="text-sm font-medium"
                  >
                    Auto-Schedule
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Schedule posts for optimal times
                  </p>
                </div>
                <Switch
                  id="auto-schedule"
                  checked={autoSchedule}
                  onCheckedChange={setAutoSchedule}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Default Platform
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used when creating new posts
                  </p>
                </div>
                <Select
                  value={defaultPlatform}
                  onValueChange={(v: any) => setDefaultPlatform(v)}
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Notifications & Quick Links */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push
                </Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-digest" className="text-sm">
                  Weekly Digest
                </Label>
                <Switch
                  id="weekly-digest"
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resources / Guide */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toast.error("Please use desktop", {
                      description:
                        "For onboarding process please open in desktop",
                    });
                  } else {
                    setShowOnboarding(true);
                  }
                }}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Replay Onboarding Tour
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3"
                onClick={() => navigate("/dashboard/accounts")}
              >
                <span className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Connected Accounts</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Billing & Plans</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Plan Info */}
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Current plan:{" "}
                <span className="text-foreground font-medium">Free</span>
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

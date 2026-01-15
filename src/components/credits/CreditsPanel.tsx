import {
  Coins,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CreditsPanelProps {
  credits: number | null;
  children: React.ReactNode;
}

export const CreditsPanel = ({ credits, children }: CreditsPanelProps) => {
  const maxCredits = 100;
  const currentCredits = credits ?? 0;
  const percentage = Math.min(100, (currentCredits / maxCredits) * 100);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Credit Balance
            </h3>
            <span className="font-bold text-lg text-primary">
              {currentCredits}
            </span>
          </div>
          <Progress value={percentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>Monthly Free Plan</span>
            <span>
              {currentCredits} / {maxCredits}
            </span>
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              Cost per Post
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--twitter))]"></div>
                  Twitter
                </span>
                <span className="font-medium">10 credits</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--linkedin))]"></div>
                  LinkedIn
                </span>
                <span className="font-medium">5 credits</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
              Posting Rules
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span>Max 3 posts allowed per platform daily</span>
              </li>
              <li className="flex gap-2">
                <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span>Minimum 60s gap between posts</span>
              </li>
              <li className="flex gap-2">
                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Credits reset to 100 every month</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-primary mb-1">
              Need more credits?
            </p>
            <p className="text-[10px] text-muted-foreground mb-2">
              Premium plans with higher limits are coming soon!
            </p>
            <Badge variant="secondary" className="text-[10px]">
              Coming Soon
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, variant, ...props }) {
        // Default icons based on variant
        const defaultIcon = variant === 'destructive' 
          ? <AlertCircle className="h-5 w-5 text-destructive-foreground" />
          : <CheckCircle2 className="h-5 w-5 text-primary" />;
        
        const displayIcon = icon !== undefined ? icon : defaultIcon;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {displayIcon && (
                <div className="shrink-0 mt-0.5">
                  {displayIcon}
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:left-0 sm:right-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  );
}

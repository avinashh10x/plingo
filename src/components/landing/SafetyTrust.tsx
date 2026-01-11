import { motion } from "framer-motion";
import { Lock, key, Shield, PowerOff } from "lucide-react";

export const SafetyTrust = () => {
  return (
    <section className="py-24 px-6 bg-background border-y border-border/40">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Your account safety is our priority
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          We use official APIs and never store your sensitive passwords.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Secure OAuth Connections</h3>
            <p className="text-sm text-muted-foreground">
              We connect directly with platforms via their official secure login
              pages.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <Shield className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">No Auto-Posting</h3>
            <p className="text-sm text-muted-foreground">
              Nothing goes live without your explicit approval. You are in
              control.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <PowerOff className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Disconnect Anytime</h3>
            <p className="text-sm text-muted-foreground">
              Revoke access instantly from your settings or within the social
              platforms.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Zero Password Storage</h3>
            <p className="text-sm text-muted-foreground">
              We literally cannot see your passwords. They never touch our
              servers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

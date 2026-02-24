import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span>AI-Powered ISO Certification</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-display leading-[1.1]">
            Get certified faster with <br className="hidden md:block" />
            <span className="text-gradient">Intelligent Automation</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop drowning in paperwork. Our AI analyzes your sector, recommends the exact ISO standards you need, and generates all required compliance documentation in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-all">
                Start Onboarding
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base font-semibold rounded-xl border-border bg-background hover:bg-muted hover:-translate-y-0.5 transition-all">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        >
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
            title="Smart Recommendations"
            description="Our AI instantly recommends the right ISO standards (9001, 27001, etc.) based on your specific industry and company size."
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-blue-500" />}
            title="Instant Documentation"
            description="Generate comprehensive, audit-ready policies and procedures tailored to your operations with a single click."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="w-8 h-8 text-purple-500" />}
            title="Multi-Company Support"
            description="Manage compliance for multiple entities or clients from a single, beautiful dashboard designed for scale."
          />
        </motion.div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-border transition-all duration-300 group">
      <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3 font-display">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

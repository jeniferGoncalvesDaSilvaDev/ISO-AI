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
            <span>Certificação ISO com Inteligência Artificial</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-display leading-[1.1]">
            Certifique-se mais rápido com <br className="hidden md:block" />
            <span className="text-gradient">Automação Inteligente</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Pare de se afogar em papelada. Nossa IA analisa seu setor, recomenda as normas ISO exatas que você precisa e gera toda a documentação de conformidade necessária em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-all">
                Começar Onboarding
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/list" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base font-semibold rounded-xl border-border bg-background hover:bg-muted hover:-translate-y-0.5 transition-all">
                Ir para o Painel
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
            title="Recomendações Inteligentes"
            description="Nossa IA recomenda instantaneamente as normas ISO corretas (9001, 27001, etc.) com base na sua indústria específica e tamanho da empresa."
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-blue-500" />}
            title="Documentação Instantânea"
            description="Gere políticas e procedimentos abrangentes e prontos para auditoria, adaptados às suas operações com um único clique."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="w-8 h-8 text-purple-500" />}
            title="Suporte Multi-Empresa"
            description="Gerencie a conformidade de várias entidades ou clientes em um único painel moderno projetado para escala."
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

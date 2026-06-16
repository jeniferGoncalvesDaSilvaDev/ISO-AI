import { useState } from "react";
import { useParams } from "wouter";
import {
  Building2, CheckSquare, FileText, Sparkles, AlertCircle,
  CheckCircle2, Download, FileSignature, Loader2, Send, MessageCircle,
  ChevronRight, Folder, FolderOpen, Cloud, RefreshCw, Info
} from "lucide-react";
import jsPDF from "jspdf";

import { useCompany } from "@/hooks/use-companies";
import { useCompanyIsos, useRecommendIso, useSelectIso } from "@/hooks/use-iso";
import { useCompanyDocuments, useGenerateDocuments } from "@/hooks/use-documents";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const COMMON_ISOS = [
  { code: "ISO 9001", name: "Gestão da Qualidade", desc: "A mais adotada no mundo, para qualquer setor" },
  { code: "ISO 27001", name: "Segurança da Informação", desc: "Proteção de dados e sistemas digitais" },
  { code: "ISO 14001", name: "Gestão Ambiental", desc: "Responsabilidade e conformidade ambiental" },
  { code: "ISO 45001", name: "Saúde e Segurança", desc: "Segurança ocupacional e bem-estar dos colaboradores" },
  { code: "ISO 22000", name: "Segurança de Alimentos", desc: "Para indústria alimentícia e restaurantes" },
  { code: "ISO 13485", name: "Dispositivos Médicos", desc: "Para fabricantes e distribuidores de equipamentos médicos" },
];

// ── Utility: Button label wrapper ─────────────────────────────────────────────
// Evita text nodes soltos como filhos diretos de elementos com siblings dinâmicos,
// prevenindo o erro "insertBefore: node is not a child of this node" causado por
// extensões do browser (Google Translate, Grammarly, etc.) que manipulam o DOM.
function BtnLabel({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-2">{children}</span>;
}

// ── Step Progress Indicator ───────────────────────────────────────────────────
function StepIndicator({
  hasIsos,
  hasDocs,
  activeTab,
  onTabChange,
}: {
  hasIsos: boolean;
  hasDocs: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const steps = [
    { id: "iso", label: "Selecionar ISOs", subtitle: hasIsos ? "Concluído" : "Clique aqui para começar", done: hasIsos, active: activeTab === "iso" },
    { id: "generate", label: "Gerar Documentos", subtitle: hasDocs ? "Concluído" : hasIsos ? "Pronto para gerar" : "Aguardando ISOs", done: hasDocs, active: activeTab === "generate" },
    { id: "documents", label: "Ver e Baixar", subtitle: hasDocs ? `Documentos salvos na nuvem ☁️` : "Aguardando geração", done: hasDocs, active: activeTab === "documents" },
  ];

  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onTabChange(step.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
              ${step.done
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                : step.active
                  ? "border-primary bg-primary/5 text-primary cursor-pointer"
                  : "border-border bg-muted/30 text-muted-foreground cursor-pointer hover:bg-muted/50"
              }`}
            data-testid={`step-${step.id}`}
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold flex-shrink-0
              ${step.done ? "bg-emerald-500 text-white" : step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step.done
                ? <CheckCircle2 className="w-4 h-4" />
                : <span>{i + 1}</span>
              }
            </div>
            <div>
              {/* FIX: text nodes envolvidos em spans para evitar manipulação por extensões */}
              <p className="font-semibold text-sm leading-tight"><span>{step.label}</span></p>
              <p className="text-xs opacity-70 leading-tight mt-0.5"><span>{step.subtitle}</span></p>
            </div>
          </button>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Company Dashboard ────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const companyId = parseInt(id);
  const [activeTab, setActiveTab] = useState("iso");

  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: savedIsos } = useCompanyIsos(companyId);
  const { data: documents } = useCompanyDocuments(companyId);

  const hasIsos = !!(savedIsos && savedIsos.length > 0);
  const hasDocs = !!(documents && documents.length > 0);

  if (companyLoading) {
    return (
      <div className="p-10">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-16 w-full mb-8" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold"><span>Empresa não encontrada</span></h2>
      </div>
    );
  }

  return (
    // FIX: translate="no" impede que extensões de tradução (Google Translate, etc.)
    // manipulem o DOM diretamente, que é a causa mais comum do erro insertBefore.
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full" translate="no">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            {/* FIX: nome da empresa em span para isolar o text node */}
            <span>{company.name}</span>
          </h1>
          {hasDocs && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1">
              <Cloud className="w-3 h-3" />
              <span>Documentos salvos</span>
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary"><span>Setor: {company.sector}</span></Badge>
          <Badge variant="outline"><span>Tamanho: {company.size}</span></Badge>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        hasIsos={hasIsos}
        hasDocs={hasDocs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 mb-6 gap-1">
          <TabsTrigger value="iso" className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5" data-testid="tab-iso">
            <CheckSquare className="w-4 h-4 mr-2" />
            <span>1. Selecionar ISOs</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5" data-testid="tab-generate">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>2. Gerar Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5" data-testid="tab-documents">
            <FileText className="w-4 h-4 mr-2" />
            <span>3. Ver Arquivos</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5" data-testid="tab-chat">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span>Suporte</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iso">
          <IsoSelectionTab company={company} onSaved={() => setActiveTab("generate")} />
        </TabsContent>
        <TabsContent value="generate">
          <GenerateDocumentsTab companyId={company.id} hasIsos={hasIsos} onGenerated={() => setActiveTab("documents")} />
        </TabsContent>
        <TabsContent value="documents">
          <ViewDocumentsTab companyId={company.id} />
        </TabsContent>
        <TabsContent value="chat">
          <ChatSupportTab companyId={company.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── TAB 1: ISO SELECTION ──────────────────────────────────────────────────────
function IsoSelectionTab({ company, onSaved }: { company: any; onSaved: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: savedIsos, isLoading: isosLoading } = useCompanyIsos(company.id);
  const recommendMutation = useRecommendIso();
  const selectMutation = useSelectIso();

  const [selectedIsos, setSelectedIsos] = useState<string[]>([]);
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);

  if (savedIsos && !hasLoadedSaved) {
    setSelectedIsos(savedIsos.map((iso: any) => iso.isoCode));
    setHasLoadedSaved(true);
  }

  const handleSave = () => {
    if (selectMutation.isPending) return;
    if (selectedIsos.length === 0) {
      toast({ variant: "destructive", title: "Selecione ao menos uma norma ISO" });
      return;
    }
    selectMutation.mutate({ companyId: company.id, isos: selectedIsos }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [buildUrl(api.iso.list.path, { id: company.id })] });
        toast({ title: "✅ Normas salvas!", description: "Agora clique em 'Gerar Documentos'." });
        onSaved();
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Falha ao salvar", description: error.message });
      },
    });
  };

  const handleRecommend = () => {
    recommendMutation.mutate(company.sector, {
      onSuccess: (data) => {
        const newSet = new Set([...selectedIsos, ...data.recommended]);
        setSelectedIsos(Array.from(newSet));
        toast({ title: "IA recomendou normas!", description: `Sugeridas para o setor: ${company.sector}` });
      },
    });
  };

  const toggleIso = (code: string) => {
    setSelectedIsos(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  if (isosLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      {/* Instruction Banner */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">
          <span>Passo 1 de 3 — Escolha suas normas ISO</span>
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <span>Marque as certificações que sua empresa deseja obter. Não tem certeza? Clique em "Recomendar com IA" e nossa inteligência artificial escolhe para você com base no seu setor.</span>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle><span>Normas disponíveis</span></CardTitle>
              <CardDescription><span>Selecione uma ou mais normas ISO para sua empresa</span></CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {COMMON_ISOS.map((iso) => {
                const checked = selectedIsos.includes(iso.code);
                return (
                  <div
                    key={iso.code}
                    onClick={() => toggleIso(iso.code)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${checked ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border"}`}
                    data-testid={`iso-card-${iso.code.replace(" ", "-")}`}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleIso(iso.code)} className="mt-0.5" />
                    <div>
                      {/* FIX: cada text node em seu próprio elemento para evitar conflito com DOM externo */}
                      <p className="font-bold text-sm"><span>{iso.code}</span></p>
                      <p className="font-medium text-sm text-foreground"><span>{iso.name}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5"><span>{iso.desc}</span></p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selectedIsos.length > 0
                  ? <span key="count">{selectedIsos.length} norma(s) selecionada(s)</span>
                  : <span key="none">Nenhuma selecionada</span>
                }
              </span>
              <Button
                onClick={handleSave}
                disabled={selectMutation.isPending || selectedIsos.length === 0}
                className="hover-elevate"
                data-testid="button-save-isos"
              >
                {/* FIX: branches do ternário com key e envolvidos em BtnLabel para evitar
                    que o React perca a referência ao nó quando o estado muda */}
                {selectMutation.isPending
                  ? <BtnLabel key="saving"><Loader2 className="w-4 h-4 animate-spin" /><span>Salvando...</span></BtnLabel>
                  : <BtnLabel key="save"><CheckCircle2 className="w-4 h-4" /><span>Salvar e Continuar</span></BtnLabel>
                }
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-primary/8 to-transparent border-primary/20">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base"><span>Não sabe qual escolher?</span></CardTitle>
              <CardDescription><span>Nossa IA analisa seu setor e recomenda as normas certas.</span></CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                <span>Com base em </span><strong>{company.sector}</strong><span>, a IA vai sugerir as certificações mais importantes para o seu negócio.</span>
              </p>
              <Button
                onClick={handleRecommend}
                disabled={recommendMutation.isPending}
                className="w-full"
                variant="default"
                data-testid="button-recommend-iso"
              >
                {recommendMutation.isPending
                  ? <BtnLabel key="analyzing"><Loader2 className="w-4 h-4 animate-spin" /><span>Analisando...</span></BtnLabel>
                  : <BtnLabel key="recommend"><Sparkles className="w-4 h-4" /><span>Recomendar com IA</span></BtnLabel>
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── TAB 2: GENERATE DOCUMENTS ────────────────────────────────────────────────
function GenerateDocumentsTab({
  companyId,
  hasIsos,
  onGenerated,
}: {
  companyId: number;
  hasIsos: boolean;
  onGenerated: () => void;
}) {
  const { toast } = useToast();
  const generateMutation = useGenerateDocuments();
  const { data: savedIsos } = useCompanyIsos(companyId);
  const [gerado, setGerado] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (!savedIsos || savedIsos.length === 0) {
      toast({ variant: "destructive", title: "Selecione as normas ISO primeiro (Passo 1)" });
      return;
    }
    setGerado(false);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 85));
    }, 600);

    generateMutation.mutate(companyId, {
      onSuccess: (data: any) => {
        clearInterval(interval);
        setProgress(100);
        setGerado(true);
        setTimeout(() => onGenerated(), 1500);
      },
      onError: () => {
        clearInterval(interval);
        setProgress(0);
        toast({ variant: "destructive", title: "Erro ao gerar", description: "Tente novamente." });
      },
    });
  };

  const isGenerating = generateMutation.isPending;
  const isoNames = savedIsos?.map((s: any) => s.isoCode).join(", ") || "";

  // FIX: label da progressbar em span para isolar o text node dinâmico
  const progressLabel = progress < 30
    ? "Analisando perfil da empresa..."
    : progress < 60
      ? "Montando estrutura de documentos..."
      : progress < 85
        ? "Personalizando conteúdo..."
        : "Salvando na nuvem...";

  return (
    <div className="space-y-6">
      {/* Instruction Banner */}
      <Alert className={`border-2 ${hasIsos ? "border-primary/30 bg-primary/5" : "border-amber-200 bg-amber-50 dark:bg-amber-950/30"}`}>
        {hasIsos ? (
          <>
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">
              <span>Passo 2 de 3 — Gerar sua documentação completa</span>
            </AlertTitle>
            <AlertDescription>
              <span>Clique no botão abaixo para gerar automaticamente todos os documentos do SGQ para </span>
              <strong>{isoNames}</strong>
              <span>. O sistema gera entre 10 a 15 documentos organizados em pastas.</span>
            </AlertDescription>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700 dark:text-amber-300">
              <span>Complete o Passo 1 primeiro</span>
            </AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              <span>Selecione suas normas ISO na aba "1. Selecionar ISOs" antes de gerar os documentos.</span>
            </AlertDescription>
          </>
        )}
      </Alert>

      <Card className="overflow-hidden border-border/60 shadow-lg">
        <div className="grid md:grid-cols-2 min-h-[380px]">
          {/* Left — Action */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <FileSignature className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-3"><span>Criar todos os documentos agora</span></h2>
            <p className="text-muted-foreground mb-2 leading-relaxed text-sm">
              <span>Nossa plataforma gera automaticamente um conjunto completo de documentos ISO, organizados em pastas como um SGQ real:</span>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6 ml-2">
              <li><span>📁 Estrutura do SGQ (Escopo, Política, Objetivos, Mapa)</span></li>
              <li><span>📁 Procedimentos (Auditoria, Não Conformidade, etc.)</span></li>
              <li><span>📁 Formulários e Registros</span></li>
              <li><span>📁 Plano de Implementação</span></li>
            </ul>

            {/* FIX: progress bar label em span isolado */}
            {isGenerating && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Gerando documentos...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                  <span>{progressLabel}</span>
                </p>
              </div>
            )}

            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !hasIsos}
              className={`h-13 text-base ${isGenerating ? "opacity-80" : "hover-elevate"}`}
              data-testid="button-generate-docs"
            >
              {/* FIX: três estados com key distinto para o React não reutilizar o mesmo nó */}
              {isGenerating
                ? <BtnLabel key="generating"><Loader2 className="w-5 h-5 animate-spin" /><span>Gerando documentos...</span></BtnLabel>
                : gerado
                  ? <BtnLabel key="done"><CheckCircle2 className="w-5 h-5" /><span>Gerado! Abrindo pasta...</span></BtnLabel>
                  : <BtnLabel key="idle"><Sparkles className="w-5 h-5" /><span>Gerar Documentação Completa</span></BtnLabel>
              }
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── TAB 3: VIEW DOCUMENTS (placeholder — manter implementação existente) ──────
function ViewDocumentsTab({ companyId }: { companyId: number }) {
  // Manter implementação existente do projeto
  return null;
}

// ── TAB 4: CHAT SUPPORT (placeholder — manter implementação existente) ────────
function ChatSupportTab({ companyId }: { companyId: number }) {
  // Manter implementação existente do projeto
  return null;
}

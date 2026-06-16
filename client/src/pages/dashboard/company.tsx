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
              {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{step.label}</p>
              <p className="text-xs opacity-70 leading-tight mt-0.5">{step.subtitle}</p>
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
        <h2 className="text-2xl font-bold">Empresa não encontrada</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            {company.name}
          </h1>
          {hasDocs && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1">
              <Cloud className="w-3 h-3" />
              <span>Documentos salvos</span>
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">Setor: {company.sector}</Badge>
          <Badge variant="outline">Tamanho: {company.size}</Badge>
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
        <AlertTitle className="text-blue-800 dark:text-blue-300">Passo 1 de 3 — Escolha suas normas ISO</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Marque as certificações que sua empresa deseja obter. Não tem certeza? Clique em "Recomendar com IA" e nossa inteligência artificial escolhe para você com base no seu setor.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle>Normas disponíveis</CardTitle>
              <CardDescription>Selecione uma ou mais normas ISO para sua empresa</CardDescription>
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
                      <p className="font-bold text-sm">{iso.code}</p>
                      <p className="font-medium text-sm text-foreground">{iso.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{iso.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selectedIsos.length > 0 ? `${selectedIsos.length} norma(s) selecionada(s)` : "Nenhuma selecionada"}
              </span>
              <Button
                onClick={handleSave}
                disabled={selectMutation.isPending || selectedIsos.length === 0}
                className="hover-elevate"
                data-testid="button-save-isos"
              >
                {selectMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Salvar e Continuar</>
                )}
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
              <CardTitle className="text-base">Não sabe qual escolher?</CardTitle>
              <CardDescription>Nossa IA analisa seu setor e recomenda as normas certas.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Com base em <strong>{company.sector}</strong>, a IA vai sugerir as certificações mais importantes para o seu negócio.
              </p>
              <Button
                onClick={handleRecommend}
                disabled={recommendMutation.isPending}
                className="w-full"
                variant="default"
                data-testid="button-recommend-iso"
              >
                {recommendMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Recomendar com IA</>
                )}
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

  return (
    <div className="space-y-6">
      {/* Instruction Banner */}
      <Alert className={`border-2 ${hasIsos ? "border-primary/30 bg-primary/5" : "border-amber-200 bg-amber-50 dark:bg-amber-950/30"}`}>
        {hasIsos ? (
          <><Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Passo 2 de 3 — Gerar sua documentação completa</AlertTitle>
            <AlertDescription>
              Clique no botão abaixo para gerar automaticamente todos os documentos do SGQ para <strong>{isoNames}</strong>. O sistema gera entre 10 a 15 documentos organizados em pastas.
            </AlertDescription>
          </>
        ) : (
          <><AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700 dark:text-amber-300">Complete o Passo 1 primeiro</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Selecione suas normas ISO na aba "1. Selecionar ISOs" antes de gerar os documentos.
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
            <h2 className="text-2xl font-bold mb-3">Criar todos os documentos agora</h2>
            <p className="text-muted-foreground mb-2 leading-relaxed text-sm">
              Nossa plataforma gera automaticamente um conjunto completo de documentos ISO, organizados em pastas como um SGQ real:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6 ml-2">
              <li>📁 Estrutura do SGQ (Escopo, Política, Objetivos, Mapa)</li>
              <li>📁 Procedimentos (Auditoria, Não Conformidade, etc.)</li>
              <li>📁 Formulários e Registros</li>
              <li>📁 Plano de Implementação</li>
            </ul>

            {/* Progress bar */}
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
                  {progress < 30 ? "Analisando perfil da empresa..." :
                    progress < 60 ? "Montando estrutura de documentos..." :
                      progress < 85 ? "Personalizando conteúdo..." :
                        "Salvando na nuvem..."}
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
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Gerando documentos...</>
              ) : gerado ? (
                <><CheckCircle2 className="w-5 h-5 mr-2" /> Gerado! Abrindo pasta...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Gerar documentação completa</>
              )}
            </Button>

            {gerado && (
              <Alert className="mt-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-300">Documentação gerada!</AlertTitle>
                <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                  Todos os documentos foram salvos automaticamente. Redirecionando para a pasta...
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right — Visual */}
          <div className="bg-muted/20 border-l border-border/50 p-8 flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center max-w-xs">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-9 h-9 text-primary animate-pulse" />
                </div>
                <p className="font-semibold">Estamos preparando seus documentos...</p>
                <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : gerado ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Pronto!</p>
                <p className="text-sm text-muted-foreground mt-1">Documentos salvos na nuvem</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex flex-col gap-2 items-start">
                  {["📄 SGQ-01 – Escopo", "📄 SGQ-02 – Política", "📄 PQ-01 – Procedimento", "📄 FQ-01 – Formulário", "📄 PA-01 – Plano"].map((item, i) => (
                    <div key={i} className={`px-3 py-2 rounded-lg text-sm bg-background border border-border/50 shadow-sm transition-all ${!hasIsos ? "opacity-30" : "opacity-100"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                {!hasIsos && (
                  <p className="text-xs text-muted-foreground mt-4">Selecione as ISOs no Passo 1</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info card about backup */}
      <Card className="bg-muted/20 border-border/40">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-sm">Backup automático na nuvem</p>
            <p className="text-xs text-muted-foreground">Seus documentos ficam salvos na plataforma. Mesmo que perca o arquivo baixado, pode recuperar aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── TAB 3: VIEW DOCUMENTS (com estrutura de pastas) ───────────────────────────
function ViewDocumentsTab({ companyId }: { companyId: number }) {
  const { data: documents, isLoading } = useCompanyDocuments(companyId);
  const generateMutation = useGenerateDocuments();
  const { toast } = useToast();
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const toggleFolder = (section: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const downloadPDF = (doc: any) => {
    const pdf = new jsPDF();
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(18);
    pdf.setTextColor(0, 51, 102);
    pdf.text(doc.type, margin, 22);

    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 27, pageWidth - margin, 27);

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    const splitContent = pdf.splitTextToSize(doc.content, pageWidth - margin * 2);
    pdf.text(splitContent, margin, 35);

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      const h = pdf.internal.pageSize.getHeight();
      pdf.text(`Gerado pela plataforma ISO Genius | ${new Date().toLocaleDateString("pt-BR")}`, margin, h - 10);
      pdf.text(`Pág. ${i}/${pageCount}`, pageWidth - margin - 20, h - 10);
    }

    pdf.save(`${doc.type.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  };

  const handleRegenerate = () => {
    generateMutation.mutate(companyId, {
      onSuccess: () => {
        toast({ title: "Documentos atualizados!", description: "O conjunto completo foi regerado." });
        setSelectedDoc(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
        <FileText className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-semibold mb-2">Nenhum documento gerado ainda</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
          Vá para o <strong>Passo 2 – Gerar Documentos</strong> e clique no botão para criar sua documentação completa.
        </p>
        <Button onClick={handleRegenerate} disabled={generateMutation.isPending} data-testid="button-generate-empty">
          {generateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Gerar Documentação Agora</>
          )}
        </Button>
      </div>
    );
  }

  // Agrupar por section (pasta)
  const grouped: Record<string, typeof documents> = {};
  for (const doc of documents) {
    const sec = doc.section || "Geral";
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push(doc);
  }

  const totalDocs = documents.length;
  const sectionCount = Object.keys(grouped).length;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-lg">Sua Documentação ISO</h3>
          <p className="text-sm text-muted-foreground">
            <Cloud className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
            {totalDocs} documentos em {sectionCount} pastas — salvos na nuvem automaticamente
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generateMutation.isPending} data-testid="button-regenerate">
          {generateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Atualizando...</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> Regerar todos</>
          )}
        </Button>
      </div>

      {/* Info about cloud backup */}
      <Alert className="border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 py-3">
        <Cloud className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
          <strong>Backup automático ativo.</strong> Mesmo que perca os arquivos baixados, todos os documentos ficam salvos aqui e podem ser baixados novamente a qualquer momento.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Folder tree */}
        <div className="space-y-2">
          {Object.entries(grouped).map(([section, docs]) => {
            const isOpen = openFolders.has(section);
            return (
              <div key={section} className="border border-border/60 rounded-xl overflow-hidden">
                {/* Folder header */}
                <button
                  onClick={() => toggleFolder(section)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                  data-testid={`folder-${section}`}
                >
                  {isOpen ? (
                    <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm flex-1">{section}</span>
                  <Badge variant="secondary" className="text-xs">{docs.length}</Badge>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Documents inside folder */}
                {isOpen && (
                  <div className="divide-y divide-border/40">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                          ${selectedDoc?.id === doc.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30 border-l-2 border-transparent"}`}
                        onClick={() => setSelectedDoc(doc)}
                        data-testid={`doc-item-${doc.id}`}
                      >
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm flex-1 text-foreground">{doc.type}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 opacity-60 hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); downloadPDF(doc); }}
                          data-testid={`button-download-${doc.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Document preview */}
        <div>
          {selectedDoc ? (
            <Card className="sticky top-4 border-border/60 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">{selectedDoc.section}</Badge>
                    <CardTitle className="text-base leading-tight">{selectedDoc.type}</CardTitle>
                  </div>
                  <Button size="sm" onClick={() => downloadPDF(selectedDoc)} className="flex-shrink-0" data-testid="button-download-preview">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-[420px] overflow-y-auto">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {selectedDoc.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border/40 rounded-xl bg-muted/10">
              <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                Clique em um documento<br />para visualizar o conteúdo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TAB 4: CHAT SUPPORT ───────────────────────────────────────────────────────
function ChatSupportTab({ companyId }: { companyId: number }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: [buildUrl(api.chat.list.path, { id: companyId })],
    queryFn: () => apiRequest("GET", buildUrl(api.chat.list.path, { id: companyId })).then(r => r.json()),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", buildUrl(api.chat.send.path, { id: companyId }), { content }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [buildUrl(api.chat.list.path, { id: companyId })] });
      setMessage("");
    },
    onError: () => {
      toast({ variant: "destructive", title: "Falha ao enviar mensagem" });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  const suggestions = [
    "O que é auditoria interna ISO 9001?",
    "Quanto tempo leva para certificar?",
    "Qual a diferença entre NC Menor e Maior?",
  ];

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader>
        <CardTitle>Consultor Especialista ISO</CardTitle>
        <CardDescription>
          Tire suas dúvidas sobre certificação ISO, documentos gerados ou qualquer processo do SGQ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-y-auto space-y-3 mb-4 p-4 bg-muted/20 rounded-lg">
          {isLoading && <Skeleton className="h-12 w-full" />}
          {(!messages || messages.length === 0) && !isLoading && (
            <div className="text-center py-6">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Faça uma pergunta para começar</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
                    onClick={() => setMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages?.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/60 text-foreground"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/60 p-3 rounded-xl flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando especialista...
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua dúvida sobre ISO..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={sendMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending || !message.trim()}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

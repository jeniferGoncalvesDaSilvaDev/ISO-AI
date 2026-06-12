import { useState } from "react";
import { useParams } from "wouter";
import { 
  Building2, CheckSquare, FileText, Sparkles, AlertCircle, 
  CheckCircle2, Download, FileSignature, Loader2, Send, MessageCircle
} from "lucide-react";
import jsPDF from 'jspdf';

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
  { code: "ISO 9001", name: "Gestão da Qualidade" },
  { code: "ISO 27001", name: "Segurança da Informação" },
  { code: "ISO 14001", name: "Gestão Ambiental" },
  { code: "ISO 45001", name: "Saúde e Segurança Ocupacional" },
  { code: "ISO 22000", name: "Segurança de Alimentos" },
  { code: "ISO 13485", name: "Dispositivos Médicos" },
];

export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const companyId = parseInt(id);

  const { data: company, isLoading: companyLoading } = useCompany(companyId);

  if (companyLoading) {
    return (
      <div className="p-10">
        <Skeleton className="h-12 w-64 mb-8" />
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            <span>{company.name}</span>
          </h1>
        </div>
        <div className="flex gap-3 mt-4">
          <Badge variant="secondary" className="px-3 py-1">
            <span>Setor: {company.sector}</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-background">
            <span>Tamanho: {company.size}</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="iso" className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 mb-8 gap-1">
          <TabsTrigger value="iso" className="flex-1 min-w-[140px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm md:text-base py-3">
            <CheckSquare className="w-4 h-4 mr-2" />
            <span>Selecionar ISOs</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex-1 min-w-[140px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm md:text-base py-3">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Geração por IA</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 min-w-[140px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm md:text-base py-3">
            <FileText className="w-4 h-4 mr-2" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 min-w-[140px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm md:text-base py-3">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span>Suporte Especialista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iso">
          <IsoSelectionTab company={company} />
        </TabsContent>

        <TabsContent value="generate">
          <GenerateDocumentsTab companyId={company.id} />
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

// --- TAB 1: ISO SELECTION ---
function IsoSelectionTab({ company }: { company: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: savedIsos, isLoading: isosLoading } = useCompanyIsos(company.id);
  const recommendMutation = useRecommendIso();
  const selectMutation = useSelectIso();

  const [selectedIsos, setSelectedIsos] = useState<string[]>([]);
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);

  if (savedIsos && !hasLoadedSaved) {
    setSelectedIsos(savedIsos.map(iso => iso.isoCode));
    setHasLoadedSaved(true);
  }

  const handleRecommend = () => {
    recommendMutation.mutate(company.sector, {
      onSuccess: (data) => {
        const newSet = new Set([...selectedIsos, ...data.recommended]);
        setSelectedIsos(Array.from(newSet));
        toast({
          title: "Recomendações da IA prontas",
          description: `Normas sugeridas com base em '${company.sector}' foram selecionadas.`,
        });
        handleSave();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Falha ao obter recomendações" });
      }
    });
  };

  const handleSave = async () => {
    if (selectMutation.isPending) return;

    selectMutation.mutate({ companyId: company.id, isos: selectedIsos }, {
      onSuccess: () => {
        toast({
          title: "Seleções Salvas",
          description: "As normas foram vinculadas e a documentação está sendo gerada pela IA.",
        });
        queryClient.invalidateQueries({ queryKey: [buildUrl(api.iso.list.path, { id: company.id })] });
        queryClient.invalidateQueries({ queryKey: [buildUrl(api.documents.list.path, { id: company.id })] });
      },
      onError: (error: any) => {
        toast({ 
          variant: "destructive", 
          title: "Falha ao salvar seleções",
          description: error.message || "Erro de conexão com o servidor."
        });
      }
    });
  };

  const toggleIso = (code: string) => {
    setSelectedIsos(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  if (isosLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/60 shadow-md">
          <CardHeader>
            <CardTitle><span>Normas Alvo</span></CardTitle>
            <CardDescription>
              <span>Selecione as normas ISO que você deseja obter a certificação.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {COMMON_ISOS.map((iso) => (
              <div 
                key={iso.code} 
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${selectedIsos.includes(iso.code) 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent bg-muted hover:bg-muted/80"}`}
                onClick={() => toggleIso(iso.code)}
              >
                <Checkbox 
                  checked={selectedIsos.includes(iso.code)} 
                  onCheckedChange={() => toggleIso(iso.code)}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <p className="font-semibold text-foreground"><span>{iso.code}</span></p>
                  <p className="text-sm text-muted-foreground"><span>{iso.name}</span></p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="bg-muted/30 pt-6 border-t border-border/50 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={selectMutation.isPending}
              className="hover-elevate px-8"
            >
              <span>{selectMutation.isPending ? "Salvando..." : "Salvar Seleções"}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-none">
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <CardTitle><span>Assistente de IA</span></CardTitle>
            <CardDescription>
              <span>Não tem certeza de quais normas se aplicam ao seu negócio?</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              <span>Nossa IA pode analisar seu setor ({company.sector}) e recomendar as normas ISO mais críticas.</span>
            </p>
            <Button 
              onClick={handleRecommend} 
              disabled={recommendMutation.isPending}
              variant="default"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {recommendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Recomendar ISOs</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- TAB 2: AI GENERATION ---
function GenerateDocumentsTab({ companyId }: { companyId: number }) {
  const { toast } = useToast();
  const generateMutation = useGenerateDocuments();
  const { data: savedIsos } = useCompanyIsos(companyId);
  const [gerado, setGerado] = useState(false);

  const handleGenerate = () => {
    if (!savedIsos || savedIsos.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma ISO selecionada",
        description: "Selecione as normas alvo na primeira aba antes de gerar os documentos.",
      });
      return;
    }

    setGerado(false);
    generateMutation.mutate(companyId, {
      onSuccess: () => setGerado(true),
      onError: () => setGerado(false),
    });
  };

  const isGenerating = generateMutation.isPending;

  return (
    <Card className="overflow-hidden border-border/60 shadow-lg">
      <div className="grid md:grid-cols-2 min-h-[400px]">
        <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileSignature className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">
            <span>Gerar Documentação Automaticamente</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            <span>
              Nosso motor de IA processará o perfil da sua empresa e as normas ISO selecionadas
              para gerar políticas, manuais e procedimentos personalizados.
            </span>
          </p>

          <Button 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || !savedIsos || savedIsos.length === 0}
            className={`w-full sm:w-auto h-14 text-lg ${isGenerating ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 hover-elevate'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                <span>Gerando Políticas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                <span>Gerar com IA</span>
              </>
            )}
          </Button>

          {(!savedIsos || savedIsos.length === 0) && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle><span>Ação Necessária</span></AlertTitle>
              <AlertDescription>
                <span>Selecione pelo menos uma norma ISO primeiro.</span>
              </AlertDescription>
            </Alert>
          )}

          {gerado && (
            <Alert className="mt-6 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-800 dark:text-emerald-300">
                <span>Documentação Gerada com Sucesso!</span>
              </AlertTitle>
              <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                <span>Acesse a aba <strong>Documentos</strong> para visualizar e baixar os arquivos em PDF.</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="bg-muted/30 p-8 flex items-center justify-center border-l border-border/50 relative overflow-hidden">
          {isGenerating ? (
            <div className="text-center w-full max-w-sm">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2"><span>A IA está trabalhando...</span></h3>
              <p className="text-sm text-muted-foreground">
                <span>Redigindo políticas de conformidade adaptadas ao seu setor.</span>
              </p>
              <div className="mt-8 space-y-3 text-left">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ) : gerado ? (
            <div className="text-center w-full max-w-sm">
              <div className="w-24 h-24 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-emerald-700 dark:text-emerald-400">
                <span>Documentos Prontos!</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                <span>Seus documentos de conformidade ISO foram gerados com sucesso.</span>
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-card rounded-2xl shadow-sm border border-border/50 flex items-center justify-center mb-6 transform -rotate-6">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                <span>Pronto para compilar documentos</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// --- TAB 3: VIEW DOCUMENTS ---
function ViewDocumentsTab({ companyId }: { companyId: number }) {
  const { data: documents, isLoading } = useCompanyDocuments(companyId);
  const generateMutation = useGenerateDocuments();
  const { toast } = useToast();

  const handleManualRegenerate = () => {
    generateMutation.mutate(companyId, {
      onSuccess: () => {
        toast({
          title: "Documentação Atualizada",
          description: "Os documentos foram regerados com base nas configurações atuais.",
        });
      }
    });
  };

  const downloadPDF = (doc: any) => {
    const pdf = new jsPDF();
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(22);
    pdf.setTextColor(0, 51, 102);
    pdf.text("CERTIFICADO DE CONFORMIDADE", margin, 25);

    pdf.setFontSize(16);
    pdf.text(doc.type, margin, 35);

    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 40, pageWidth - margin, 40);

    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);

    const splitContent = pdf.splitTextToSize(doc.content, pageWidth - (margin * 2));
    pdf.text(splitContent, margin, 55);

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`ISO Genius AI Specialist - Documento Oficial de Certificação`, margin, pdf.internal.pageSize.getHeight() - 20);
      pdf.text(`Data de Emissão: ${new Date().toLocaleDateString()} | ID: ${doc.id}`, margin, pdf.internal.pageSize.getHeight() - 15);

      pdf.setDrawColor(0, 102, 204);
      pdf.rect(pageWidth - 50, pdf.internal.pageSize.getHeight() - 40, 35, 25);
      pdf.setFontSize(8);
      pdf.text("IA VALIDATED", pageWidth - 47, pdf.internal.pageSize.getHeight() - 25);
    }

    pdf.save(`${doc.type.replace(/\s+/g, '_')}_${companyId}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-border rounded-xl bg-muted/10">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2"><span>Nenhum documento encontrado</span></h3>
        <p className="text-muted-foreground mb-6">
          <span>Inicie a geração automática clicando no botão abaixo.</span>
        </p>
        <Button onClick={handleManualRegenerate} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Gerar Documentação Agora</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold"><span>Documentos de Conformidade</span></h3>
        <Button variant="outline" size="sm" onClick={handleManualRegenerate} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <span>Atualizar Tudo</span>
            </>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id}>
            <Card className="h-full flex flex-col hover-elevate border-border/60 overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-primary to-accent-foreground w-full"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                    <span>{doc.type}</span>
                  </Badge>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-muted-foreground group-hover:text-primary"
                    onClick={() => downloadPDF(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-base">
                  <span>{doc.type}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  <span>{doc.content?.slice(0, 200)}...</span>
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => downloadPDF(doc)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>Baixar PDF</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- TAB 4: CHAT SUPPORT ---
function ChatSupportTab({ companyId }: { companyId: number }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: [buildUrl(api.chat.list.path, { id: companyId })],
    queryFn: () => apiRequest(buildUrl(api.chat.list.path, { id: companyId })),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest(buildUrl(api.chat.send.path, { id: companyId }), {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
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

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader>
        <CardTitle><span>Suporte Especialista ISO</span></CardTitle>
        <CardDescription>
          <span>Tire suas dúvidas sobre certificação com nosso consultor de IA.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
          {isLoading && <Skeleton className="h-12 w-full" />}
          {(!messages || messages.length === 0) && !isLoading && (
            <p className="text-center text-muted-foreground text-sm py-8">
              <span>Faça uma pergunta sobre certificação ISO para começar.</span>
            </p>
          )}
          {messages?.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/60"
                }`}
              >
                <span>{msg.content}</span>
              </div>
            </div>
          ))}
          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/60 p-3 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
          />
          <Button onClick={handleSend} disabled={sendMutation.isPending || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

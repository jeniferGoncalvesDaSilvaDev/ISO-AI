import { useState } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, CheckSquare, FileText, Sparkles, AlertCircle, 
  CheckCircle2, Download, FileSignature, Loader2 
} from "lucide-react";

import { useCompany } from "@/hooks/use-companies";
import { useCompanyIsos, useRecommendIso, useSelectIso } from "@/hooks/use-iso";
import { useCompanyDocuments, useGenerateDocuments } from "@/hooks/use-documents";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const COMMON_ISOS = [
  { code: "ISO 9001", name: "Quality Management" },
  { code: "ISO 27001", name: "Information Security" },
  { code: "ISO 14001", name: "Environmental Management" },
  { code: "ISO 45001", name: "Occupational Health & Safety" },
  { code: "ISO 22000", name: "Food Safety Management" },
  { code: "ISO 13485", name: "Medical Devices" },
];

export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const companyId = parseInt(id);
  
  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  
  if (companyLoading) {
    return <div className="p-10"><Skeleton className="h-12 w-64 mb-8" /><Skeleton className="h-[400px] w-full" /></div>;
  }
  
  if (!company) {
    return <div className="p-10 text-center"><h2 className="text-2xl font-bold">Company not found</h2></div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">{company.name}</h1>
        </div>
        <div className="flex gap-3 mt-4">
          <Badge variant="secondary" className="px-3 py-1">Sector: {company.sector}</Badge>
          <Badge variant="outline" className="px-3 py-1 bg-background">Size: {company.size}</Badge>
        </div>
      </div>

      <Tabs defaultValue="iso" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="iso" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">
            <CheckSquare className="w-4 h-4 mr-2" />
            Select ISOs
          </TabsTrigger>
          <TabsTrigger value="generate" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generation
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-base">
            <FileText className="w-4 h-4 mr-2" />
            Documents
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
      </Tabs>
    </div>
  );
}

// --- TAB 1: ISO SELECTION ---
function IsoSelectionTab({ company }: { company: any }) {
  const { toast } = useToast();
  const { data: savedIsos, isLoading: isosLoading } = useCompanyIsos(company.id);
  const recommendMutation = useRecommendIso();
  const selectMutation = useSelectIso();
  
  const [selectedIsos, setSelectedIsos] = useState<string[]>([]);
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);

  // Sync saved isos to local state once loaded
  if (savedIsos && !hasLoadedSaved) {
    setSelectedIsos(savedIsos.map(iso => iso.isoCode));
    setHasLoadedSaved(true);
  }

  const handleRecommend = () => {
    recommendMutation.mutate(company.sector, {
      onSuccess: (data) => {
        // Merge recommended with currently selected to avoid losing selections
        const newSet = new Set([...selectedIsos, ...data.recommended]);
        setSelectedIsos(Array.from(newSet));
        toast({
          title: "AI Recommendations ready",
          description: `Suggested standards based on '${company.sector}' have been selected.`,
        });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to get recommendations" });
      }
    });
  };

  const handleSave = () => {
    selectMutation.mutate({ companyId: company.id, isos: selectedIsos }, {
      onSuccess: () => {
        toast({
          title: "Selections Saved",
          description: "Your ISO target standards have been updated.",
        });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to save selections" });
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
            <CardTitle>Target Standards</CardTitle>
            <CardDescription>Select the ISO standards you want to achieve certification for.</CardDescription>
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
                  <p className="font-semibold text-foreground">{iso.code}</p>
                  <p className="text-sm text-muted-foreground">{iso.name}</p>
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
              {selectMutation.isPending ? "Saving..." : "Save Selections"}
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
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Not sure which standards apply to your business?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Our AI can analyze your sector ({company.sector}) and recommend the most critical ISO standards for compliance and operational excellence.
            </p>
            <Button 
              onClick={handleRecommend} 
              disabled={recommendMutation.isPending}
              variant="default"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {recommendMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Recommend ISOs</>
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

  const handleGenerate = () => {
    if (!savedIsos || savedIsos.length === 0) {
      toast({
        variant: "destructive",
        title: "No ISOs selected",
        description: "Please select target standards in the first tab before generating documents.",
      });
      return;
    }

    generateMutation.mutate(companyId, {
      onSuccess: () => {
        toast({
          title: "Documents Generated!",
          description: "AI has successfully created your compliance documentation.",
        });
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Generation failed", description: err.message });
      }
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
          <h2 className="text-3xl font-bold font-display mb-4">Auto-Generate Documentation</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Our Gemini AI engine will process your company profile and selected ISO standards to generate customized policies, manuals, and procedures required for certification.
          </p>

          <Button 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || !savedIsos || savedIsos.length === 0}
            className={`w-full sm:w-auto h-14 text-lg ${isGenerating ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 hover-elevate'}`}
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Generating Policies...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-3" /> Generate with AI</>
            )}
          </Button>

          {(!savedIsos || savedIsos.length === 0) && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>You must select at least one ISO standard first.</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="bg-muted/30 p-8 flex items-center justify-center border-l border-border/50 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full max-w-sm"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI is working...</h3>
                <p className="text-sm text-muted-foreground">Drafting comprehensive compliance policies tailored to your exact sector constraints.</p>
                
                <div className="mt-8 space-y-3 text-left">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto bg-card rounded-2xl shadow-sm border border-border/50 flex items-center justify-center mb-6 transform -rotate-6">
                  <FileText className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">Ready to compile documents</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

// --- TAB 3: VIEW DOCUMENTS ---
function ViewDocumentsTab({ companyId }: { companyId: number }) {
  const { data: documents, isLoading } = useCompanyDocuments(companyId);

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
        <h3 className="text-xl font-semibold mb-2">No documents found</h3>
        <p className="text-muted-foreground">Go to the AI Generation tab to create your compliance docs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {documents.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="h-full flex flex-col hover-elevate border-border/60 overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-primary to-accent-foreground w-full"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                  {doc.type}
                </Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground group-hover:text-primary">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">Policy Document</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-lg border border-border/50 h-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/40 z-10 pointer-events-none"></div>
                <pre className="font-sans whitespace-pre-wrap">{doc.content}</pre>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center text-sm text-muted-foreground">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> Audit Ready</span>
              <Button variant="link" className="px-0">View Full Document</Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

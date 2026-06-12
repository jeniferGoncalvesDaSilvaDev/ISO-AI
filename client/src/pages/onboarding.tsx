import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building, Factory, Users } from "lucide-react";

import { useCreateCompany } from "@/hooks/use-companies";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = api.companies.create.input;
type FormValues = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCompany = useCreateCompany();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", sector: "", size: "" },
  });

  function onSubmit(data: FormValues) {
    createCompany.mutate(data, {
      onSuccess: (company) => {
        toast({ title: "Empresa criada!", description: `${company.name} foi registrada com sucesso.` });
        setLocation(`/dashboard/company/${company.id}`);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Erro ao criar empresa", description: error.message });
      },
    });
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Configurar Empresa</h1>
        <p className="text-muted-foreground mt-2">Preencha os dados da empresa para iniciar o processo de certificação ISO.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Detalhes da Empresa</CardTitle>
          <CardDescription>Insira os detalhes principais da entidade que busca a certificação.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      Nome da Empresa
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Acme Corp Ltda" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-primary" />
                      Setor da Indústria
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Software, Manufatura, Saúde" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription>Isso ajuda nossa IA a recomendar as normas corretas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Tamanho da Empresa
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>Selecione o tamanho</option>
                        <option value="1-10">Micro (1-10 funcionários)</option>
                        <option value="11-50">Pequena (11-50 funcionários)</option>
                        <option value="51-200">Média (51-200 funcionários)</option>
                        <option value="201-1000">Grande (201-1000 funcionários)</option>
                        <option value="1000+">Corporação (1000+ funcionários)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={createCompany.isPending}
              >
                {createCompany.isPending ? "Criando..." : "Criar Empresa e Continuar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Extract the input schema from the API contract
const formSchema = api.companies.create.input;
type FormValues = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const createCompany = useCreateCompany();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sector: "",
      size: "",
    },
  });

  function onSubmit(data: FormValues) {
    createCompany.mutate(data, {
      onSuccess: (company) => {
        toast({
          title: "Company created!",
          description: `${company.name} has been successfully registered.`,
        });
        setLocation(`/dashboard/company/${company.id}`);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error creating company",
          description: error.message,
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 flex flex-col justify-center relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-display">Setup Your Company</h1>
          <p className="text-muted-foreground mt-2">Let's get some basic information to tailor your ISO journey.</p>
        </div>

        <Card className="glass-card border-border shadow-xl">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Enter the primary details for the entity seeking certification.</CardDescription>
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
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Acme Corp, LLC" 
                          {...field} 
                          className="h-12 bg-background/50 focus:bg-background transition-colors"
                        />
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
                        Industry Sector
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Software, Manufacturing, Healthcare" 
                          {...field} 
                          className="h-12 bg-background/50 focus:bg-background transition-colors"
                        />
                      </FormControl>
                      <FormDescription>This helps our AI recommend the right standards.</FormDescription>
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
                        Company Size
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50 focus:bg-background transition-colors">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">Micro (1-10 employees)</SelectItem>
                          <SelectItem value="11-50">Small (11-50 employees)</SelectItem>
                          <SelectItem value="51-200">Medium (51-200 employees)</SelectItem>
                          <SelectItem value="201-1000">Large (201-1000 employees)</SelectItem>
                          <SelectItem value="1000+">Enterprise (1000+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold mt-4 shadow-md hover-elevate"
                  disabled={createCompany.isPending}
                >
                  {createCompany.isPending ? "Creating..." : "Create & Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

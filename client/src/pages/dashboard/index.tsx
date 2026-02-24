import { Link } from "wouter";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardIndex() {
  const { data: companies, isLoading } = useCompanies();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Select a company to manage ISO compliance</p>
        </div>
        <Link href="/onboarding">
          <Button className="hover-elevate">
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : companies && companies.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {companies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/dashboard/company/${company.id}`}>
                <Card className="h-full hover-elevate cursor-pointer border-border/50 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{company.name}</CardTitle>
                    <CardDescription>{company.sector}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      Size: {company.size}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center text-sm text-muted-foreground">
                    <span>Manage Compliance</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No companies yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by adding your first company to begin the ISO certification process.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="hover-elevate">Create Company</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

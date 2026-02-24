import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCompanyDocuments(companyId: number | null) {
  return useQuery({
    queryKey: [api.documents.list.path, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const url = buildUrl(api.documents.list.path, { id: companyId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
    enabled: !!companyId,
  });
}

export function useGenerateDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: number) => {
      const url = buildUrl(api.documents.generate.path, { id: companyId });
      const res = await fetch(url, {
        method: api.documents.generate.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400 || res.status === 404 || res.status === 500) {
          const errorType = res.status as keyof typeof api.documents.generate.responses;
          // @ts-ignore
          const errorSchema = api.documents.generate.responses[errorType];
          const error = errorSchema.parse(await res.json());
          throw new Error(error.message || "Failed to generate documents");
        }
        throw new Error("An unexpected error occurred");
      }
      return api.documents.generate.responses[201].parse(await res.json());
    },
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.documents.list.path, companyId] 
      });
    },
  });
}

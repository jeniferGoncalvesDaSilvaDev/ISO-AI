import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useRecommendIso() {
  return useMutation({
    mutationFn: async (sector: string) => {
      const res = await fetch(api.iso.recommend.path, {
        method: api.iso.recommend.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get recommendations");
      return api.iso.recommend.responses[200].parse(await res.json());
    },
  });
}

export function useCompanyIsos(companyId: number | null) {
  return useQuery({
    queryKey: [api.iso.list.path, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const url = buildUrl(api.iso.list.path, { id: companyId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ISO selections");
      return api.iso.list.responses[200].parse(await res.json());
    },
    enabled: !!companyId,
  });
}

export function useSelectIso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, isos }: { companyId: number; isos: string[] }) => {
      const url = buildUrl(api.iso.select.path, { id: companyId });
      const res = await fetch(url, {
        method: api.iso.select.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isos }),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.iso.select.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save ISO selections");
      }
      return api.iso.select.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.iso.list.path, variables.companyId] 
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type InsertCompany = z.infer<typeof api.companies.create.input>;

function getUserId(): number | null {
  const id = localStorage.getItem("userId");
  return id ? Number(id) : null;
}

export function useCompanies() {
  const userId = getUserId();
  return useQuery({
    queryKey: [api.companies.list.path, userId],
    queryFn: async () => {
      const url = userId ? `${api.companies.list.path}?userId=${userId}` : api.companies.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return api.companies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompany(id: number | null) {
  return useQuery({
    queryKey: [api.companies.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.companies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch company");
      return api.companies.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCompany) => {
      const userId = getUserId();
      const res = await fetch(api.companies.create.path, {
        method: api.companies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.companies.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create company");
      }
      return api.companies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      const userId = getUserId();
      queryClient.invalidateQueries({ queryKey: [api.companies.list.path, userId] });
    },
  });
}

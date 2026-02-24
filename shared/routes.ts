import { z } from "zod";
import { insertCompanySchema, insertIsoSelectionSchema, insertDocumentSchema, companies, isoSelections, documents } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() })
};

export const api = {
  companies: {
    create: {
      method: "POST" as const,
      path: "/api/companies" as const,
      input: insertCompanySchema,
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/companies" as const,
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>())
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/companies/:id" as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound
      }
    }
  },
  iso: {
    recommend: {
      method: "POST" as const,
      path: "/api/iso/recommend" as const,
      input: z.object({ sector: z.string() }),
      responses: {
        200: z.object({ recommended: z.array(z.string()) })
      }
    },
    select: {
      method: "POST" as const,
      path: "/api/companies/:id/iso" as const,
      input: z.object({ isos: z.array(z.string()) }),
      responses: {
        201: z.array(z.custom<typeof isoSelections.$inferSelect>()),
        400: errorSchemas.validation
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/companies/:id/iso" as const,
      responses: {
        200: z.array(z.custom<typeof isoSelections.$inferSelect>())
      }
    }
  },
  documents: {
    generate: {
      method: "POST" as const,
      path: "/api/companies/:id/documents/generate" as const,
      responses: {
        201: z.array(z.custom<typeof documents.$inferSelect>()),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/companies/:id/documents" as const,
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

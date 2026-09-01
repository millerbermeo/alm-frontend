import { z } from "zod";

import { PROJECT_STATUS } from "@/config/constants";

/**
 * Single schema backing the create + edit form (all fields always present).
 * Mirrors the backend `projects::service` rules. Empty optional strings are
 * turned into `undefined` when the request body is built, not here.
 */
export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "El nombre es demasiado largo"),
  slug: z
    .string()
    .trim()
    .max(140, "El slug es demasiado largo")
    .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), {
      message: "Usa minúsculas, números y guiones simples",
    }),
  description: z.string().trim().max(2000, "La descripción es demasiado larga"),
  status: z.enum(PROJECT_STATUS),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

import { z } from "zod";

/** Backend slugifies the name; it only needs to be non-empty and not absurd. */
export const folderFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre es demasiado largo")
    .refine((v) => /[a-z0-9]/i.test(v), { message: "Usa al menos una letra o un número" }),
});

export type FolderFormValues = z.infer<typeof folderFormSchema>;

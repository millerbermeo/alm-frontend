import { z } from "zod";

import { IMAGE_VISIBILITY } from "@/config/constants";

/** Edit form for an image's metadata (backend `UpdateImageRequest`). */
export const imageMetaSchema = z.object({
  title: z.string().trim().max(255, "El título es demasiado largo"),
  alt_text: z.string().trim().max(512, "El texto alternativo es demasiado largo"),
  description: z.string().trim().max(2000, "La descripción es demasiado larga"),
  visibility: z.enum(IMAGE_VISIBILITY),
  folder_id: z.string(), // "" = root / no folder
});
export type ImageMetaValues = z.infer<typeof imageMetaSchema>;

const KEY_RE = /^img_(live|test)_[0-9a-f]{40}$/;

export const pasteKeySchema = z.object({
  secret: z.string().trim().regex(KEY_RE, "Se espera img_live_… / img_test_… (48 caracteres)"),
});
export type PasteKeyValues = z.infer<typeof pasteKeySchema>;

export const newKeyNameSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "El nombre es demasiado largo"),
});
export type NewKeyNameValues = z.infer<typeof newKeyNameSchema>;

import { z } from "zod";

import { IMAGE_PERMISSIONS } from "@/config/constants";

const permission = z.enum(IMAGE_PERMISSIONS);

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "El nombre es demasiado largo"),
  permissions: z.array(permission).min(1, "Selecciona al menos un permiso"),
  test: z.boolean(),
  /** `datetime-local` value; "" means "no expiry". Converted to RFC3339 on submit. */
  expires_at: z
    .string()
    .refine((v) => v === "" || new Date(v).getTime() > Date.now(), {
      message: "La caducidad debe ser una fecha futura",
    }),
});
export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>;

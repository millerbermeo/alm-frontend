"use client";

import { toast as heroToast } from "@heroui/react";

import { toMessage } from "@/lib/errors";

/**
 * Thin, app-facing toast API. Keeps call sites decoupled from HeroUI's queue
 * and gives us one place to tune defaults / copy.
 */
export const toast = {
  success: (message: string) => heroToast.success(message),
  error: (err: unknown) => heroToast.danger(toMessage(err)),
  info: (message: string) => heroToast.info(message),
  warning: (message: string) => heroToast.warning(message),
};

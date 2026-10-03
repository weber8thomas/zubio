import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide");

export const publishSlotSchema = z.object({
  skill: z.string().min(1, "Choisissez une discipline"),
  date: z.iso.date("Date invalide"),
  start: time,
  duration: z.coerce.number().int().min(30).max(240),
  rate: z.coerce
    .number({ message: "Indiquez un tarif" })
    .min(10, "Tarif minimum : 10 €")
    .max(500, "Tarif maximum : 500 €"),
  notes: z.string().trim().max(280).optional().default(""),
});

export const uuidSchema = z.uuid();

export const availabilitySchema = z
  .object({
    weekday: z.coerce.number().int().min(1).max(7),
    start: time,
    end: time,
  })
  .refine((a) => a.end > a.start, { message: "La fin doit suivre le début", path: ["end"] });

export const providerProfileSchema = z.object({
  bio: z.string().trim().max(400),
  commune: z.string().trim().min(2).max(80),
  radiusKm: z.coerce.number().int().min(1).max(50),
  minRate: z.coerce.number().min(0).max(200),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

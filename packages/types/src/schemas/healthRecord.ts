import { z } from "zod";

export const HealthRecordSchema = z.object({
  _id: z.string(),
  dog: z.string(), // ref to Dog
  recordType: z.enum(["vaccination", "medication", "checkup"]),
  notes: z.string(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type HealthRecord = z.infer<typeof HealthRecordSchema>;

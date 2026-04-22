import { z } from "zod";

export const reapplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((val) => {
    if (!val) return false;
    const dob = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
      (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
    return age >= 16;
  }, "Student must be at least 16 years old"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  addressLine1: z.string().min(1, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  academicYear: z.string().min(1, "Academic year is required"),
});

export type ReapplicationInput = z.infer<typeof reapplicationSchema>;

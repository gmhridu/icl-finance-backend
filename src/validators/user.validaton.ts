import z from "zod";

export const registerUserValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long!" }),
  email: z.email({ message: "Input Valid Email Address!" }).optional(),
  phone: z
    .string()
    .min(10, { message: "Phone must be at least 10 characters long!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long!" }),
});

import z from "zod";

const registerUserValidationSchema = z.object({
  body: z.object({
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
  }),
});

const loginUserValidationSchema = z.object({
  body: z.object({
    email: z.email({ message: "Input Valid Email Address!" }).optional(),
    phone: z
      .string("Phone Number is required")
      .min(10, { message: "Phone must be at least 10 characters long!" }),
    password: z
      .string("Password is required")
      .min(6, { message: "Password must be at least 6 characters long!" }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string("Refresh token is required!"),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string("Old password is required"),
    newPassword: z.string("Password is required"),
  }),
});

export const UserValidations = {
  registerUserValidationSchema,
  loginUserValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
};

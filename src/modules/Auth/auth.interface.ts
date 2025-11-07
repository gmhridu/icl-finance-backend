export type TRegisterUser = {
  name: string;
  email?: string;
  phone: string;
  password: string;
};

export type TLoginUser = {
  email?: string;
  phone?: string;
  password: string;
};

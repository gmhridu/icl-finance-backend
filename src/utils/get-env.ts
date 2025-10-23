export const getEnv = (key: string, defualtValue: string = "") => {
  const val = process.env[key] ?? defualtValue;

  if (!val) throw new Error("Missing env variable: " + key);

  return val;
};

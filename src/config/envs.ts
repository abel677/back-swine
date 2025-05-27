import * as dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno obligatoria: ${key}`);
  }
  return value;
};

export const envConfig = {
  // Base de Datos
  MYSQLDB_HOST: getEnv("MYSQLDB_HOST", "localhost"),
  MYSQLDB_USER: getEnv("MYSQLDB_USER", "root"),
  MYSQLDB_PASSWORD: getEnv("MYSQLDB_PASSWORD", ""),
  MYSQLDB_ROOT_PASSWORD: getEnv("MYSQLDB_ROOT_PASSWORD", "root"),
  MYSQLDB_DATABASE: getEnv("MYSQLDB_DATABASE", ""),
  MYSQLDB_LOCAL_PORT: Number(getEnv("MYSQLDB_LOCAL_PORT", "3306")),
  MYSQLDB_DOCKER_PORT: Number(getEnv("MYSQLDB_DOCKER_PORT", "3306")),

  // JWT
  JWT_SECRET: getEnv("JWT_SECRET"),

  // MailTrap
  MAIL_PASSWORD: getEnv("MAIL_PASSWORD"),
  MAIL_USERNAME: getEnv("MAIL_USERNAME"),
  MAIL_PORT: Number(getEnv("MAIL_PORT", "2525")),
  MAIL_HOST: getEnv("MAIL_HOST", "smtp.mailtrap.io"),

  // Node.js
  NODE_LOCAL_PORT: Number(getEnv("NODE_LOCAL_PORT", "3000")),
  NODE_DOCKER_PORT: Number(getEnv("NODE_DOCKER_PORT", "3000")),

  // App
  PORT: Number(getEnv("PORT", "3000")),
  DOMAIN: getEnv("DOMAIN", "http://localhost:3000/api/v1"),
};

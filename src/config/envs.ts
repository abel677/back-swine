
import * as dotenv from "dotenv";
dotenv.config();

const {
  MYSQLDB_HOST = "localhost",
  MYSQLDB_USER = "root",
  MYSQLDB_PASSWORD = "",
  MYSQLDB_ROOT_PASSWORD = "root",
  MYSQLDB_DATABASE = "",
  MYSQLDB_LOCAL_PORT = "3306",
  MYSQLDB_DOCKER_PORT = "3306",
  JWT_SECRET = "",
  MAIL_PASSWORD = "",
  MAIL_USERNAME = "",
  MAIL_PORT = "2525",
  MAIL_HOST = "smtp.mailtrap.io",
  NODE_LOCAL_PORT = "3000",
  NODE_DOCKER_PORT = "3000",

  PORT = "3000",
  DOMAIN = "http://localhost:3000/api/v1",
} = process.env;

const requiredVars = [JWT_SECRET, MAIL_PASSWORD, MAIL_USERNAME];
requiredVars.forEach((varName) => {
  if (!varName) {
    throw new Error(`Falta la variable de entorno: ${varName}`);
  }
});

export const envConfig = {
  // Base de Datos
  MYSQLDB_HOST,
  MYSQLDB_USER,
  MYSQLDB_PASSWORD,
  MYSQLDB_ROOT_PASSWORD,
  MYSQLDB_DATABASE,
  MYSQLDB_LOCAL_PORT: Number(MYSQLDB_LOCAL_PORT),
  MYSQLDB_DOCKER_PORT: Number(MYSQLDB_DOCKER_PORT),

  // JWT
  JWT_SECRET,

  // MailTrap
  MAIL_PASSWORD,
  MAIL_USERNAME,
  MAIL_PORT: Number(MAIL_PORT),
  MAIL_HOST,

  // Node.js
  NODE_LOCAL_PORT: Number(NODE_LOCAL_PORT),
  NODE_DOCKER_PORT: Number(NODE_DOCKER_PORT),

  // URL de la aplicación
  PORT: Number(PORT),
  DOMAIN,
};

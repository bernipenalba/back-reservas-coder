import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = ["PORT", "NODE_ENV"];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `Faltan definir las siguientes variables de entorno: ${missingVars.join(", ")}. Revisá tu archivo .env (ver .env.example).`
  );
  process.exit(1);
}

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
};

export default config;

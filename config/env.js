// Levanta las variables de entorno del archivo .env
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') })

//------------------------------- Enviroment Variables ----------------------------------
export default {
  app: {
    env: process.env.APP_NODE_ENV || 'development',
    pwd: process.env.APP_PWD || "",
    ssl_port: parseInt(process.env.APP_SSL_PORT) || 443,
    port: parseInt(process.env.APP_PORT) || 8080,
    frontEndUrl: process.env.FRONT_END_URL,
    logLevel: parseInt(process.env.APP_LOG_LEVEL) || 0,
  },
  users: {
    admin: {
      email: process.env.APP_ADMIN_EMAIL || 'admin@admin',
      pass: process.env.APP_ADMIN_PASS || 'admin',
      name: process.env.APP_ADMIN_NAME || 'admin',
      lastName: process.env.APP_ADMIN_LAST_NAME || 'admin'
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    saltWorkFactor: parseInt(process.env.JWT_SWF || '10')
  },
  tables: {
    cdc: {
      prefix: process.env.TABLES_CDC_PREFIX || 'cdc_',
      id: process.env.TABLES_CDC_PREFIX || 'cdc_id',
      action: process.env.TABLES_CDC_PREFIX || 'cdc_action',
      createdAt: process.env.TABLES_CDC_PREFIX || 'cdc_created_at',
      ignore: ['permisos'] // Tablas que no quiero que tengan cdc
    }
  }
}
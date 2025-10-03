import { DataSource } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: 'ContainerEnv' });

const generalConfig: MysqlConnectionOptions  = {
  type: "mysql",
  host: process.env.TYPEORM_DB_HOST,
  port: parseInt(process.env.TYPEORM_DB_PORT || "3306"),
  username: process.env.TYPEORM_DB_USERNAME,
  password: process.env.TYPEORM_DB_PASSWORD,
  database: process.env.TYPEORM_DB_NAME,
  synchronize: false,
  logging: ["error", "warn", "schema"],
  entities: [__dirname + "/../**/entity/general/*.entity{.js,.ts}"],
  migrations: [__dirname + "/../**/migration/general/**/*{.ts,.js}"],
  subscribers: [__dirname + "/../**/subscriber/general/**/*{.ts,.js}"],
  migrationsRun: process.env.RUN_MIGRATIONS == 'true',
  extra: {
    ssl: {
      rejectUnauthorized: false, // This is the key option
    },
    // For older versions or different drivers, you might need:
    // trustServerCertificate: true,
  },
};

const general = new DataSource(generalConfig);

export default general;
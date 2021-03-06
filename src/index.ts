import FurudeRika from './client/FurudeRika';
import dotenv from 'dotenv';
import 'reflect-metadata';

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      DEV_GUILD_ID: string;
      MONGODB_USER: string;
      MONGODB_PASSWORD: string;
      BANCHO_API_KEY: string;
    }
  }
}

const furudeRika = new FurudeRika();

void furudeRika.start();

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const isDebug = process.env.DEBUG_SQL === 'true';
    super({
      log: isDebug
        ? [
            { emit: 'stdout', level: 'query' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ],
    });
  }

  async onModuleInit(): Promise<void> {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        break;
      } catch (error) {
        retries -= 1;
        if (retries === 0) {
          console.error('Failed to connect to Prisma Database after retries:', error);
        } else {
          console.warn(`Prisma database connection attempt failed (Neon cold-start). Retrying in 2 seconds... (${retries} retries left)`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(): Promise<void> {
    process.on('beforeExit', async () => {
      await this.$disconnect();
    });
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const models = Reflect.ownKeys(this).filter(
      (key): key is string => typeof key === 'string' && !key.startsWith('_'),
    );

    return Promise.all(
      models.map((modelName) => (this as any)[modelName].deleteMany()),
    ).then(() => undefined);
  }
}

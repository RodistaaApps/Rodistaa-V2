import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const logLevel = configService.get<string>('LOG_LEVEL', 'info');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    const prismaOptions: PrismaClientOptions = {
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: nodeEnv === 'development' 
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
          ]
        : [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ],
    };

    super(prismaOptions);

    // Set up logging event handlers
    if (nodeEnv === 'development') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });

    this.$on('info' as never, (e: any) => {
      this.logger.log(`Prisma Info: ${e.message}`);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma client connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Prisma client:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma client disconnected');
  }
}


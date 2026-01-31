import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { JsonApiInterceptor } from './common/interceptors/jsonapi.interceptor';
import { ConnectionsModule } from './connections/connections.module';
import { GoalsModule } from './goals/goals.module';
import { HealthModule } from './health/health.module';
import { HistoryModule } from './history/history.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow'),
    AuthModule,
    TasksModule,
    ProjectsModule,
    HistoryModule,
    GoalsModule,
    CommentsModule,
    ConnectionsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonApiInterceptor,
    },
  ],
})
export class AppModule {}

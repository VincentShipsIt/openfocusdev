import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { HistoryModule } from './history/history.module';
import { GoalsModule } from './goals/goals.module';
import { CommentsModule } from './comments/comments.module';
import { ConnectionsModule } from './connections/connections.module';
import { JsonApiInterceptor } from './common/interceptors/jsonapi.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow',
    ),
    AuthModule,
    TasksModule,
    ProjectsModule,
    HistoryModule,
    GoalsModule,
    CommentsModule,
    ConnectionsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonApiInterceptor,
    },
  ],
})
export class AppModule {}


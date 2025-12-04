import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { SocialModule } from './social/social.module';
import { PostsModule } from './posts/posts.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { DiscoverModule } from './discover/discover.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    AuthModule,
    UsersModule,
    ProfileModule,
    SocialModule,
    PostsModule,
    FileUploadModule,
    ItinerariesModule,
    NotificationsModule,
    AdminModule,
    DiscoverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

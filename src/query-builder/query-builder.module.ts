import { Module } from '@nestjs/common';
import { QueryBuilderService } from './query-builder.service';
import { QueryBuilderController } from './query-builder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/app/auth/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [QueryBuilderService],
  controllers: [QueryBuilderController],
})
export class QueryBuilderModule {}
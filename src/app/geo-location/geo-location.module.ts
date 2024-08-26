import { Module } from '@nestjs/common';
import { GeoLocationService } from './geo-location.service';
import { GeoLocationController } from './geo-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoLocation } from './geo-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeoLocation])],
  providers: [GeoLocationService],
  controllers: [GeoLocationController],
})
export class GeoLocationModule {}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoLocation } from './geo-location.entity';
import { Repository } from 'typeorm';
import { CreateGeoLocationDto } from './geo-location.dto';
import { ResponseSuccess } from 'src/interface/respone';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class GeoLocationService extends BaseResponse {
  constructor(
    @InjectRepository(GeoLocation)
    private readonly geoLocationRepository: Repository<GeoLocation>,
  ) {
    super();
  }

  async getGeoLocation(id: number): Promise<ResponseSuccess> {
    const geoLocation = await this.geoLocationRepository.findOne({
      where: {
        id,
      },
    });
    if (!geoLocation) {
      throw new NotFoundException('Geolocation not found');
    }
    return this._success('oke', geoLocation);
  }

  async createGeoLocation(pay: CreateGeoLocationDto): Promise<ResponseSuccess> {
    const data = this.geoLocationRepository.save(pay);
    return this._success('oke', data);
  }

  async updateGeoLocation(
    id: number,
    updateGeoLocationDto: CreateGeoLocationDto,
  ): Promise<ResponseSuccess> {
    const geoLocation = await this.geoLocationRepository.findOne({
      where: {
        id,
      },
    });
    if (!geoLocation) {
      throw new NotFoundException('Geolocation not found');
    }

    const updatedGeoLocation = this.geoLocationRepository.merge(
      geoLocation,
      updateGeoLocationDto,
    );
    const data = this.geoLocationRepository.save(updatedGeoLocation);
    return this._success('oke', data);
  }

  async deleteGeoLocation(id: number): Promise<ResponseSuccess> {
    const geoLocation = await this.geoLocationRepository.findOne({
      where: {
        id,
      },
    });
    if (!geoLocation) {
      throw new NotFoundException('Geolocation not found');
    }

    const data = await this.geoLocationRepository.remove(geoLocation);
    return this._success('oke', data);
  }
}

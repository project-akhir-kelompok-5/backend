import { Test, TestingModule } from '@nestjs/testing';
import { JamJadwalService } from './jam-jadwal.service';

describe('JamJadwalService', () => {
  let service: JamJadwalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JamJadwalService],
    }).compile();

    service = module.get<JamJadwalService>(JamJadwalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

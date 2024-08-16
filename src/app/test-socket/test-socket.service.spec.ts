import { Test, TestingModule } from '@nestjs/testing';
import { TestSocketService } from './test-socket.service';

describe('TestSocketService', () => {
  let service: TestSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestSocketService],
    }).compile();

    service = module.get<TestSocketService>(TestSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

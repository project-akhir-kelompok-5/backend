import { Test, TestingModule } from '@nestjs/testing';
import { TestSocketGateway } from './test-socket.gateway';

describe('TestSocketGateway', () => {
  let gateway: TestSocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestSocketGateway],
    }).compile();

    gateway = module.get<TestSocketGateway>(TestSocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

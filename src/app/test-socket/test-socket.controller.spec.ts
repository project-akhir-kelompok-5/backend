import { Test, TestingModule } from '@nestjs/testing';
import { TestSocketController } from './test-socket.controller';

describe('TestSocketController', () => {
  let controller: TestSocketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSocketController],
    }).compile();

    controller = module.get<TestSocketController>(TestSocketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

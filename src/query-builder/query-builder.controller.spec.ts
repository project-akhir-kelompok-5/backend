import { Test, TestingModule } from '@nestjs/testing';
import { QueryBuilderController } from './query-builder.controller';

describe('QueryBuilderController', () => {
  let controller: QueryBuilderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryBuilderController],
    }).compile();

    controller = module.get<QueryBuilderController>(QueryBuilderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

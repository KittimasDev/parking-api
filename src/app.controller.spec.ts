import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockAppService = {
      getWelcomeMessage: jest.fn().mockReturnValue('Mock Welcome Message'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getWelcomeMessage', () => {
    it('should return mocked welcome message', () => {
      expect(appController.getWelcomeMessage()).toBe('Mock Welcome Message');
    });
  });
});

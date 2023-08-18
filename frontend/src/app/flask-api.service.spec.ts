import { TestBed } from '@angular/core/testing';

import { FlaskApiService } from './flask-api.service';

describe('FlaskApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FlaskApiService = TestBed.get(FlaskApiService);
    expect(service).toBeTruthy();
  });
});

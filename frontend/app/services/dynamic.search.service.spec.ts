import { TestBed, inject } from '@angular/core/testing';

import { Dynamic.SearchService } from './dynamic.search.service';

describe('Dynamic.SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Dynamic.SearchService]
    });
  });

  it('should be created', inject([Dynamic.SearchService], (service: Dynamic.SearchService) => {
    expect(service).toBeTruthy();
  }));
});

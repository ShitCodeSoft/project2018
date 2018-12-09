import { TestBed, inject } from '@angular/core/testing';

import { GetEmployeeService } from './get-employee.service';

describe('GetEmployeeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetEmployeeService]
    });
  });

  it('should be created', inject([GetEmployeeService], (service: GetEmployeeService) => {
    expect(service).toBeTruthy();
  }));
});

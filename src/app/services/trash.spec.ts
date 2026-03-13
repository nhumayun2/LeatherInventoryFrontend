import { TestBed } from '@angular/core/testing';

import { Trash } from './trash';

describe('Trash', () => {
  let service: Trash;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Trash);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

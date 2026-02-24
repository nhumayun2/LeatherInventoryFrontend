import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignDetails } from './design-details';

describe('DesignDetails', () => {
  let component: DesignDetails;
  let fixture: ComponentFixture<DesignDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

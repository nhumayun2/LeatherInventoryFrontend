import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignModal } from './design-modal';

describe('DesignModal', () => {
  let component: DesignModal;
  let fixture: ComponentFixture<DesignModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFinance } from './client-finance';

describe('ClientFinance', () => {
  let component: ClientFinance;
  let fixture: ComponentFixture<ClientFinance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFinance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientFinance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDesigns } from './product-designs';

describe('ProductDesigns', () => {
  let component: ProductDesigns;
  let fixture: ComponentFixture<ProductDesigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDesigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDesigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

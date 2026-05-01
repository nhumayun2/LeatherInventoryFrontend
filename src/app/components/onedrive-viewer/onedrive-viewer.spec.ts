import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnedriveViewer } from './onedrive-viewer';

describe('OnedriveViewer', () => {
  let component: OnedriveViewer;
  let fixture: ComponentFixture<OnedriveViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnedriveViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnedriveViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

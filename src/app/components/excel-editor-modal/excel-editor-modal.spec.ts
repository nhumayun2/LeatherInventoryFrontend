import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelEditorModal } from './excel-editor-modal';

describe('ExcelEditorModal', () => {
  let component: ExcelEditorModal;
  let fixture: ComponentFixture<ExcelEditorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelEditorModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelEditorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

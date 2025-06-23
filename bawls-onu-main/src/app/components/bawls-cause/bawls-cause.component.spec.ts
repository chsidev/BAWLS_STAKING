import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BawlsCauseComponent } from './bawls-cause.component';

describe('BawlsCauseComponent', () => {
  let component: BawlsCauseComponent;
  let fixture: ComponentFixture<BawlsCauseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BawlsCauseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BawlsCauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

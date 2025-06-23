import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BawlsListComponent } from './bawls-list.component';

describe('BawlsListComponent', () => {
  let component: BawlsListComponent;
  let fixture: ComponentFixture<BawlsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BawlsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BawlsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

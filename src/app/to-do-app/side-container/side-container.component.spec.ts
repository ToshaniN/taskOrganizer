import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideContainerComponent } from './side-container.component';

describe('SideContainerComponent', () => {
  let component: SideContainerComponent;
  let fixture: ComponentFixture<SideContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

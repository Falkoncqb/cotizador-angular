import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoClientes } from './ingreso-clientes';

describe('IngresoClientes', () => {
  let component: IngresoClientes;
  let fixture: ComponentFixture<IngresoClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoClientes],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

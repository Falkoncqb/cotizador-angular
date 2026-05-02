import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ingreso-clientes',
  imports: [ReactiveFormsModule],
  templateUrl: './ingreso-clientes.html',
  styleUrl: './ingreso-clientes.css',
})
export class IngresoClientes {
  clienteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      nombre: [''],
      rut: [''],
      telefono: [''],
      correo: [''],
      direccion: ['']
    });
  }

  limpiar() {
    this.clienteForm.reset();
  }

  guardar() {
    console.log('Datos del cliente:', this.clienteForm.value);
    // Aquí puedes agregar lógica para guardar en backend
  }
}

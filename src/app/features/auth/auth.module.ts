// src/app/features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

// LoginComponent and RegisterComponent are standalone and should not be declared/imported in a module like this.
// import { LoginComponent } from './login/login.component'; 
// import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    // LoginComponent, // Removed: Standalone component
    // RegisterComponent // Removed: Standalone component
  ],
  exports: [
    // LoginComponent, // Removed: Standalone component
    // RegisterComponent // Removed: Standalone component
  ]
})
export class AuthModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesRoutingModule } from './courses-routing.module';
import { CoursesListComponent } from './courses-list/courses-list.component';

@NgModule({
  declarations: [
    // הסר את CoursesListComponent מכאן
  ],
  imports: [
    CommonModule,
    CoursesRoutingModule,
    CoursesListComponent // הוסף אותו כאן במקום
  ]
})
export class CoursesModule { }
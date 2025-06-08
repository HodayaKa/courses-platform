import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoursesListComponent } from './courses-list/courses-list.component';
import { AuthGuard } from '../../app.routes';

const routes: Routes = [
  { path: '', component: CoursesListComponent },
  // בהמשך נוסיף ניתובים נוספים כמו פרטי קורס ועריכת קורס
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursesRoutingModule { }
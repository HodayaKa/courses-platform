import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule], // Add RouterModule here
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent { }
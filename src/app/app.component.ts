import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component'; // ייבוא ה-Header
import { FooterComponent } from './core/footer/footer.component'; // ייבוא ה-Footer

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent, // הוספת ה-Header לקומפוננטה
    FooterComponent  // הוספת ה-Footer לקומפוננטה
  ],
  template: `
    <app-header></app-header>
    <main>
      <div class="page-container">
        <router-outlet></router-outlet>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'courses-platform';
}
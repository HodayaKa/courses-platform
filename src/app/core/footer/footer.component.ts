import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <p>&copy; 2025 פלטפורמת הקורסים. כל הזכויות שמורות.</p>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent { }
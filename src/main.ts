// בקובץ main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // ייבוא של appConfig

bootstrapApplication(AppComponent, appConfig) // שימוש ב-appConfig
  .catch(err => console.error(err));
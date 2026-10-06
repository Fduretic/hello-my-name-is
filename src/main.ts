import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(() => {
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'The signal was interrupted. Please reload to tune in again.';
});

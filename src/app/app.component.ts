import { Component } from '@angular/core';
import { CRTScreenComponent } from './crt-screen.component';
import { DISPLAY_NAME } from './display-name.generated';

@Component({
  selector: 'app-root',
  imports: [CRTScreenComponent],
  template: `
    <div class="page">
      <header class="masthead">
        <a class="wordmark" href="/" aria-label="Hello, stranger — home"><span class="brand-symbol" aria-hidden="true">✳</span> HELLO, STRANGER.</a>
        <span class="edition">A LITTLE INTRODUCTION<span>ON A DIFFERENT FREQUENCY</span></span>
      </header>
      <main aria-label="A televised introduction">
        <app-crt-screen [name]="name" />
      </main>
      <footer class="page-footer">
        <span>SOME CONNECTIONS START WITH A HELLO.</span>
        <span class="live-note"><i aria-hidden="true"></i> ALWAYS A PLEASURE.</span>
      </footer>
    </div>
  `,
})
export class AppComponent { readonly name = DISPLAY_NAME; }

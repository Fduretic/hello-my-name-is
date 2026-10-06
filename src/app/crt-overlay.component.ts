import { Component } from '@angular/core';

@Component({
  selector: 'app-crt-overlay',
  host: { 'aria-hidden': 'true', class: 'crt-overlay' },
  template: `<div class="phosphor"></div><div class="scanlines"></div><div class="vignette"></div><div class="glass-reflection"></div>`,
})
export class CRTOverlayComponent {}

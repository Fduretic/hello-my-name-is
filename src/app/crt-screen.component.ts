import { Component, input, signal } from '@angular/core';
import { NameTagComponent } from './name-tag.component';
import { CRTOverlayComponent } from './crt-overlay.component';

@Component({
  selector: 'app-crt-screen',
  imports: [NameTagComponent, CRTOverlayComponent],
  template: `
    <svg class="filter-definitions" aria-hidden="true" width="0" height="0">
      <defs>
        <filter id="screen-curve" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB" primitiveUnits="objectBoundingBox">
          <feImage href="/barrel-map.png" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.065" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
    <section class="television" [class.powered-off]="!powered()" aria-label="Hellovision color television">
      <div class="screen-surround">
        <div class="crt-screen">
          <div class="signal" [attr.aria-hidden]="!powered()">
            <div class="channel" aria-hidden="true">AV 1<span>STEREO</span></div>
            <app-name-tag [name]="name()" [active]="powered()" />
            <span class="screen-caption" aria-hidden="true">NICE TO MEET YOU.</span>
          </div>
          <app-crt-overlay />
          <span class="standby-message" [class.visible]="!powered()">UNTIL NEXT TIME.</span>
        </div>
      </div>
      <div class="tv-console">
        <div class="tv-brand">hellovision<span>COLOR TELEVISION</span></div>
        <div class="speaker" aria-hidden="true"></div>
        <div class="power-controls">
          <span class="power-status"><i [class.on]="powered()" aria-hidden="true"></i><span>{{ powered() ? 'ON AIR' : 'STANDBY' }}</span></span>
          <button class="power-button" (click)="powered.set(!powered())" [attr.aria-pressed]="powered()" [attr.aria-label]="powered() ? 'Turn television off' : 'Turn television on'" title="Power">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v8M7.2 5.7a8 8 0 1 0 9.6 0" /></svg>
          </button>
        </div>
      </div>
      <span class="sr-only" role="status">{{ powered() ? 'Television on' : 'Television off. Use the power button to turn it on.' }}</span>
    </section>
  `,
})
export class CRTScreenComponent { readonly name = input.required<string>(); readonly powered = signal(true); }

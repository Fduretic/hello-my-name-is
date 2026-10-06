import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { NAME_FONTS } from './name-fonts';

@Component({
  selector: 'app-name-tag',
  template: `
    <article class="name-tag" [attr.aria-label]="'Hello, my name is ' + name()">
      <div class="tag-header" aria-hidden="true"><span class="hello">HELLO</span><span class="introduction">my name is</span></div>
      <div class="name-field" #field><h1 #lettering>{{ name() }}</h1></div>
      <div class="tag-footer" aria-hidden="true"></div>
    </article>
  `,
})
export class NameTagComponent implements AfterViewInit, OnDestroy {
  readonly name = input.required<string>();
  readonly active = input(true);
  private readonly field = viewChild.required<ElementRef<HTMLElement>>('field');
  private readonly lettering = viewChild.required<ElementRef<HTMLElement>>('lettering');
  private observer?: ResizeObserver;
  private destroyed = false;
  private fontsReady = false;
  private fontIndex = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private motionPreference?: MediaQueryList;
  private readonly resumeRotation = () => this.scheduleNext();

  constructor() {
    effect(() => {
      this.active();
      this.scheduleNext();
    });
  }

  ngAfterViewInit(): void {
    this.observer = new ResizeObserver(() => this.fitName());
    this.observer.observe(this.field().nativeElement);
    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionPreference.addEventListener('change', this.resumeRotation);
    document.addEventListener('visibilitychange', this.resumeRotation);
    // Preload the faces before rotating to avoid late font swaps.
    void Promise.allSettled(NAME_FONTS.map(font =>
      document.fonts.load(`${font.weight} 48px "${font.family}"`, this.name()),
    )).then(() => {
      if (this.destroyed) return;
      this.fontsReady = true;
      this.fitName();
      this.scheduleNext();
    });
  }

  private scheduleNext(): void {
    clearTimeout(this.timer);
    if (!this.fontsReady || this.destroyed || !this.active() ||
        document.hidden || this.motionPreference?.matches) return;

    this.timer = setTimeout(() => {
      this.fontIndex = (this.fontIndex + 1) % NAME_FONTS.length;
      const font = NAME_FONTS[this.fontIndex];
      const text = this.lettering().nativeElement;
      text.style.fontFamily = `"${font.family}", 'UnifrakturCook', Georgia, serif`;
      text.style.fontWeight = String(font.weight);
      this.fitName();
      this.scheduleNext();
    }, 2000 + Math.floor(Math.random() * 2001));
  }

  private fitName(): void {
    const field = this.field().nativeElement;
    const text = this.lettering().nativeElement;
    let size = field.clientHeight * 0.57;
    text.style.fontSize = `${size}px`;
    const available = field.clientWidth * 0.88;
    // Painted/handwritten glyph bounds do not always scale linearly at small sizes.
    for (let pass = 0; pass < 4 && text.scrollWidth > available; pass++) {
      size *= Math.max(1, available - 1) / text.scrollWidth;
      text.style.fontSize = `${size}px`;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    clearTimeout(this.timer);
    this.observer?.disconnect();
    this.motionPreference?.removeEventListener('change', this.resumeRotation);
    document.removeEventListener('visibilitychange', this.resumeRotation);
  }
}

import { AfterViewInit, Component, ElementRef, OnDestroy, input, viewChild } from '@angular/core';

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
  private readonly field = viewChild.required<ElementRef<HTMLElement>>('field');
  private readonly lettering = viewChild.required<ElementRef<HTMLElement>>('lettering');
  private observer?: ResizeObserver;
  private destroyed = false;

  ngAfterViewInit(): void {
    this.observer = new ResizeObserver(() => this.fitName());
    this.observer.observe(this.field().nativeElement);
    void document.fonts.ready.then(() => { if (!this.destroyed) this.fitName(); });
  }

  private fitName(): void {
    const field = this.field().nativeElement;
    const text = this.lettering().nativeElement;
    const initialSize = field.clientHeight * 0.57;
    text.style.fontSize = `${initialSize}px`;
    const available = field.clientWidth * 0.88;
    if (text.scrollWidth > available) {
      text.style.fontSize = `${initialSize * available / text.scrollWidth}px`;
    }
  }

  ngOnDestroy(): void { this.destroyed = true; this.observer?.disconnect(); }
}

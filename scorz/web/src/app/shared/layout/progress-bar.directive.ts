import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import ProgressBar from 'progressbar.js';

@Directive({
  selector: '[appProgressBar]'
})
export class ProgressBarDirective implements OnInit {
  @Input() height: number = 6;
  @Input() lineColor: string = '#D03355';
  @Input() gradientColors?: string[];
  @Input() start: number = 0;
  @Input() end: number = 100;
  @Input() stop: number = 0;
  @Input()trailWidth: number = 4;
  @Input() shape: 'line' | 'circle' | 'hexagon' = 'line'; // Added shape input

  private bar: ProgressBar.Path | ProgressBar.Circle | ProgressBar.Line | undefined;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initProgressBar();
  }

  private initProgressBar() {
    const options: any = {
      strokeWidth: this.height,
      color: this.lineColor,
      trailColor: '#eee',
      trailWidth: 4,
      svgStyle: { width: '100%', height: '100%' }
    };

    if (this.gradientColors) {
      options.from = { color: this.gradientColors[1] };
      options.to = { color: this.gradientColors[0] };
      options.step = (state: any, bar: any) => {
        bar.path.setAttribute('stroke', state.color);
      };
    }

    if (this.shape === 'circle') {
      this.bar = new ProgressBar.Circle(this.el.nativeElement, options);
    }  else {
      this.bar = new ProgressBar.Line(this.el.nativeElement, options);
    }

    this.setProgress((this.stop - this.start) / (this.end - this.start));
  }

  private setProgress(value: number) {
    if (this.bar) {
      this.bar.animate(value); // Number from 0.0 to 1.0
    }
  }


}

import { fadeAnimations } from '../../shared/animations';
import { Component } from '@angular/core';
import { BaseIndexComponent } from '@sifca-monorepo/clients';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimations],
})
export class IndexComponent extends BaseIndexComponent {
  testimonialscarousel: OwlOptions = {
    items: 3,
    loop: true,
    autoplay: false,
    dots: true,
    nav: false,
    responsive:{
      0:{items:1
    },
    2000:{items:2
    }}
  };
  testimonials = [
    {
      userName: 'Leah Stanley',
      estimatedReturns: '$425.20',
      winningDate: 'Jan 2022',
      userImage: 'assets/img/testimonial/user-2.png',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
    {
      userName: 'Megan Clayton',
      estimatedReturns: '$99.51',
      winningDate: 'Dec 2021',
      userImage: 'assets/img/testimonial/user-3.png',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
    {
      userName: 'Ruhio S. Albert',
      estimatedReturns: '$205.20',
      winningDate: 'Apr 2022',
      userImage: 'assets/img/testimonial/user-1.jpg',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
  ];

  screenshotsCarousel: OwlOptions = {
    nav: false,
    dots: false,
    loop: true,

    center: true,

    responsive: {
      0: {
        items: 1,
      },
      500: {
        items: 2,
      },
      700: {
        items: 3,
      },
      900: {
        items: 4,
      },
      1100: {
        items: 5,
      },
    },
  };

}

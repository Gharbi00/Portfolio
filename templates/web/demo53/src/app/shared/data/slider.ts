import { OwlOptions } from "ngx-owl-carousel-o";
// Home Slider
export let HomeSlider: any = {
    loop: true,
    nav: true,
    dots: false,
    navContainerClass: 'owl-nav',
    navClass: [ 'owl-prev', 'owl-next' ],
    navText: [ '<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>' ],
    responsive: {
        0: {
            items: 1
        },
        400: {
            items: 1
        },
        740: {
            items: 1
        },
        940: {
            items: 1
        }
    },
};

// Blog Slider
export let BlogSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        0: {
            items: 1
        },
        400: {
            items: 2
        },
        740: {
            items: 2
        },
        940: {
            items: 3
        },
        1200: {
            items: 3
        }
    }
};

// Insta Slider
export let InstaSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        740: {
            items: 3
        },
        940: {
            items: 6
        },
        1200: {
            items: 6
        }
    }
};

// Logo Slider
export let LogoSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        767: {
            items: 5
        },
        576: {
            items: 4
        },
        480: {
            items: 3
        },
        0: {
            items: 2
        }
    }
};

// Collection Slider
export let CollectionSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        991: {
            items: 4 
        },
        767: {
            items: 3    
        },
        586: {
            items: 2
        },
        0: {
            items: 1
        }
    }
};

// Category Slider
export let CategorySlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        1024: {
            items: 6
        },
        767: {
            items: 5
        },
        576: {
            items: 5
        },
        480: {
            items: 3
        },
        0: {
            items: 2
        }
    }
};

// Testimonial Slider
export let TestimonialSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        991: {
            items: 2
        },
        0: {
            items: 1
        }
    }
}

// Team Slider
export let TeamSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        991: {
            items: 4
        },
        767: {
            items: 3
        },
        586: {
            items: 2
        },
        0: {
            items: 2
        }
    }
}

// Compare Slider
export let  CompareSlider: any = {
    loop: true,
    dots: false,
    navSpeed: 300,
    responsive: {
        991: {
            items: 4
        },
        767: {
            items: 3
        },
        586: {
            items: 2
        },
        0: {
            items: 1
        }
    }
}

// Product Slider
export let ProductSlider: any = {
    loop: false,
    dots: false,
    navSpeed: 300,
    autoHeight:true,
    responsive: {
        991: {
            items: 4
        },
        767: {
            items: 3
        },
        420: {
            items: 2
        }, 
        0: {
            items: 1
        }
    }
}

// Product Slider
export let ProductOneSlider: any = {
    items: 1,
    loop: true,
    dots: false,
    navSpeed: 300
}

// New Product Slider
export let NewProductSlider: any = {
    items: 1,
    loop: true,
    nav: true,
    dots:false,
    navContainerClass: 'owl-nav',
    navClass: [ 'owl-prev', 'owl-next' ],
    navText: [ '<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>' ],
}

// Product Details Main Slider
export let ProductDetailsMainSlider: any = {
    items: 1,
    nav: false,
    dots:false,
    autoplay: false,
    slideSpeed: 300,
    loop: true
}

// Product Details Thumb Slider
export let ProductDetailsThumbSlider: any = {
    items: 3,
    loop: true,
    margin: 10,
    dots:false
}


export let MainSlider: OwlOptions = {
    loop: true,
    nav: true,
    dots: false,
    autoplay:true,
    autoplayTimeout:10000,
    autoplaySpeed:1200,
    items:1,
    navText:['<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;"><</button>','<button class="slick-next slick-arrow" aria-label="Next" type="button" style="display: block;">></button>'],
    
    
};


export let TrendingProducts: OwlOptions = {
    loop: true,
    nav: true,
    dots: false,
    autoplay:true,
    autoplayTimeout:8000,
    autoplaySpeed:1000,
    navSpeed:900,

    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 2
        },
        900: {
            items: 3
        },
        1200: {
            items: 4
        },
        


    },
    navText:['<button class="prev"><</button>','<button class="next" >></button>']
};
export let BrandCarousel: OwlOptions = {
    margin:40,
    loop:true,
    autoplay:true,
    autoplayTimeout:8300,
    autoplaySpeed:1000,
    dots:false,
    slideBy:5,
    responsive: {
        0: {
            items: 1
        },
        400: {
            items: 2
        },
        700: {
            items: 3
        },
        900: {
            items: 4
        },
        1000: {
            items: 5
        },
        1300: {
            items: 6
        },


    },

};
export let customSlider:OwlOptions={
    loop:true,
    autoplay:true,
    autoplayTimeout:7000,
    autoplaySpeed:1000,
    dots:false,
    nav:false,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 2
        },
        800: {
            items: 3
        },

        1000: {
            items: 4
        },


    },

}
export let ProductCarousel:OwlOptions={
    loop:true,
    autoplay:true,
    autoplayTimeout:4000,
    autoplaySpeed:1000,
    dots:false,
    slideBy:5,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 2
        },
        800: {
            items: 3
        },
        1000: {
            items: 4
        },
        1400: {
            items: 5
        },


    },

};
export let NewProductsCarousel:OwlOptions={
    loop:true,
    center:true,
    autoplay:true,
    autoplayTimeout:7000,
    autoplaySpeed:1000,
    dots:false,
    responsive: {
        0: {
            items: 1
        },
        700: {
            items: 2
        },
        1200: {
            items: 3
        },



    },

}

export let NewProductsCarousel2:OwlOptions={
    loop:true,
    autoplay:true,
    autoplayTimeout:9000,
    autoplaySpeed:1000,
    dots:false,
    nav:true,
    responsive:{
        0:{items:1}
    },
    navText:['<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;">Previous</button><buttonclass="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;">Previous</buttonclass=>','<button class="slick-next slick-arrow" aria-label="Next" type="button"style="display: block;">Next</button>']




}
export let InstaCarousel: OwlOptions = {
  
    loop:true,
    autoplay:true,
    autoplayTimeout:9000,
    autoplaySpeed:1000,
    dots:false,
    slideBy:5,
    responsive: {
        0: {
            items: 1
        },
        400: {
            items: 2
        },
        700: {
            items: 3
        },
        900: {
            items: 4
        },
        1200: {
            items: 5
        },



    },

};
export let BlogCarousel:OwlOptions={
      
    loop:true,
    autoplay:true,
    autoplayTimeout:9000,
    autoplaySpeed:1000,
    dots:false,
    slideBy:4,
    responsive: {
        0: {
            items: 1
        },
        500: {
            items: 2
        },
        700: {
            items: 3
        },
        1000: {
            items: 4
        },




    },

}

export let NgbnavCarousel: OwlOptions = {
    loop: true,
    nav: false,
    dots: false,
    autoplay:true,
    autoplayTimeout:8000,
    autoplaySpeed:1000,
    navSpeed:900,

    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 2
        },
        900: {
            items: 3
        },
        1200: {
            items: 4
        },


    },
    
};
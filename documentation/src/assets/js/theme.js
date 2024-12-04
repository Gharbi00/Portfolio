


(function($) {
  "use strict";

  // Counter Function
  var timer = document.querySelectorAll('.timer');
  if (timer.length) {
      timer.forEach(function(element) {
          if (element.getBoundingClientRect().top < window.innerHeight) {
              var countTo = new CountUp(element, 0, parseInt(element.textContent), 0, 2);
              countTo.start();
          }
      });
  }

  // Navigation Scroll
  window.addEventListener('scroll', function() {
      var sticky = document.querySelector('.sticky-menu'),
          scroll = window.scrollY || window.pageYOffset;
      if (scroll >= 100) sticky.classList.add('fixed');
      else sticky.classList.remove('fixed');
  });

  // From Bottom to Top Button
  window.addEventListener('scroll', function() {
      var scrollButton = document.querySelector('.scroll-top');
      if (scrollButton) {
          if (window.scrollY > 200) scrollButton.style.display = 'block';
          else scrollButton.style.display = 'none';
      }
  });

  // Click event to scroll to top
  var scrollTopButton = document.querySelector('.scroll-top');
  if (scrollTopButton) {
      scrollTopButton.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return false;
      });
  }

  // Scroll animate
  var links = document.querySelectorAll('a.scroll-target');
  links.forEach(function(link) {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          var targetId = this.getAttribute('href').substring(1),
              target = document.getElementById(targetId);
          if (target) {
              var targetOffset = target.offsetTop - 120;
              window.scrollTo({ top: targetOffset, behavior: 'smooth' });
          }
      });
  });

  // Add .active class to current navigation based on URL
  var currentPage = window.location.pathname.split('/').pop();
  var navLinks = document.querySelectorAll(".navbar-nav > li  a");
  navLinks.forEach(function(navLink) {
      var href = navLink.getAttribute("href");
      if (href === currentPage || href === '')
          navLink.classList.add("active");
  });

  // MixItUp
  if (document.querySelector(".mixitUp-container")) {
      var containerEl = document.querySelector('.mixitUp-container');
      var mixer = mixitup(containerEl);
  }

  // Password Toggler
  var passVicon = document.querySelector(".passVicon");
  if (passVicon) {
      passVicon.addEventListener('click', function() {
          passVicon.classList.toggle("eye-slash");
          var input = document.querySelector(".pass_log_id");
          if (input.getAttribute("type") === "password") {
              input.setAttribute("type", "text");
          } else {
              input.setAttribute("type", "password");
          }
      });
  }

  // Company Logo Slider
  var companiesLogoSlider = document.querySelector(".companies-logo-slider");
  if (companiesLogoSlider) {
      var prevArrow = document.querySelector('.prev');
      var nextArrow = document.querySelector('.next');
      companiesLogoSlider.slick({
          centerMode: true,
          centerPadding: '0px',
          slidesToShow: 7,
          prevArrow: prevArrow,
          nextArrow: nextArrow,
          autoplay: true,
          autoplaySpeed: 3000,
          responsive: [{
                  breakpoint: 991,
                  settings: {
                      arrows: true,
                      centerMode: true,
                      slidesToShow: 5
                  }
              },
              {
                  breakpoint: 768,
                  settings: {
                      arrows: true,
                      centerMode: true,
                      slidesToShow: 3
                  }
              },
              {
                  breakpoint: 480,
                  settings: {
                      arrows: true,
                      centerMode: true,
                      slidesToShow: 2
                  }
              }
          ]
      });
  }

// ------------------------ Company Logo Slider
        if($(".partnerSliderTwo").length) {
          $('.partnerSliderTwo').slick({
              centerMode: true,
              centerPadding: '0px',
              arrows: false,
              slidesToShow: 5,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
              {
                  breakpoint: 992,
                  settings: {
                    centerMode: true,
                    slidesToShow: 4
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    centerMode: true,
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    centerMode: true,
                    slidesToShow: 2
                  }
                }
              ]
            });
        }

// ------------------------ Client Feedback Slider One
        if($(".clientSliderOne").length) {
          $('.clientSliderOne').slick({
              centerMode: true,
              centerPadding: '0px',
              slidesToShow: 1,
              prevArrow: $('.prev_c'),
              nextArrow: $('.next_c'),
              autoplay: true,
              autoplaySpeed: 6000,
            });
        }


// ------------------------ Image Slick Slider 
        if($(".img-slick-slider").length) {
          $('.img-slick-slider').slick({
              dots: true,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 1,
              autoplay: true,
              autoplaySpeed: 6000,
            });
        }



// ------------------------ Client Feedback Slider Two
        if($(".clientSliderTwo").length) {
          $('.clientSliderTwo').slick({
              dots: true,
              arrows: false,
              centerMode: true,
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 3,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }

// ------------------------ Team Slider One
        if($(".teamSliderOne").length) {
          $('.teamSliderOne').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prev_c'),
              nextArrow: $('.next_c'),
              centerPadding: '0px',
              slidesToShow: 4,
              slidesToScroll: 1,
              autoplay: false,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// ------------------------ Client Feedback Slider Three
        if($(".clientSliderThree").length) {
          $('.clientSliderThree').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prevT'),
              nextArrow: $('.nextT'),
              centerPadding: '0px',
              slidesToShow: 1,
              slidesToScroll: 1,
              autoplay: false,
              autoplaySpeed: 3000,
            });
        }


// ------------------------ Client Feedback Slider Four
        if($(".clientSliderFour").length) {
          $('.clientSliderFour').slick({
              dots: true,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 3,
              autoplay: false,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]
            });
        }

// ------------------------ Client Feedback Slider Five
        if($(".clientSliderFive").length) {
          $('.clientSliderFive').slick({
              centerMode: true,
              centerPadding: '0px',
              slidesToShow: 1,
              prevArrow: $('.prev_f'),
              nextArrow: $('.next_f'),
              autoplay: true,
              autoplaySpeed: 6000,
            });
        }


// ------------------------ Client Feedback Slider Six
        if($(".clientSliderSix").length) {
          $('.clientSliderSix').slick({
              dots: true,
              arrows: false,
              centerMode: true,
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 3,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]
            });
        }


// ------------------------ Client Feedback Slider Seven
        if($(".clientSliderSeven").length) {
          $('.clientSliderSeven').slick({
              centerMode: true,
              centerPadding: '0px',
              slidesToShow: 1,
              prevArrow: $('.prev_cs1'),
              nextArrow: $('.next_cs1'),
              autoplay: true,
              fade: true,
              autoplaySpeed: 6000,
            });
        }

// ------------------------ Client Feedback Slider Eight
        if($(".clientSliderEight").length) {
          $('.clientSliderEight').slick({
              dots: true,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]
            });
        }


// ------------------------ App Screen Preview 
        if($(".app-preview-slider-one").length) {
          $('.app-preview-slider-one').slick({
              dots: false,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 3,
              centerMode: true,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 2,
                    centerMode: false,
                  }
                }
              ]
            });
        }


// ------------------------ App Screen Preview Two
        if($(".app-preview-slider-two").length) {
          $('.app-preview-slider-two').slick({
              dots: false,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 5,
              centerMode: true,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// ------------------------ Portfolio Slider One
        if($(".portfolio_slider_one").length) {
          $('.portfolio_slider_one').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prev_case1'),
              nextArrow: $('.next_case1'),
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: false,
              centerMode:true,
              autoplaySpeed: 3000,

            });
        }

// ------------------------ Portfolio Slider Two
        if($(".portfolio_slider_two").length) {
          $('.portfolio_slider_two').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prev_case2'),
              nextArrow: $('.next_case2'),
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: false,
              centerMode:true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// ------------------------ Portfolio Three 
        if($(".portfolio_slider_three").length) {
          $('.portfolio_slider_three').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prev_c'),
              nextArrow: $('.next_c'),
              centerPadding: '0px',
              slidesToShow: 4,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// ------------------------ Product Slider One
        if($(".product_slider_one").length) {
          $('.product_slider_one').slick({
              dots: false,
              arrows: true,
              prevArrow: $('.prev_p1'),
              nextArrow: $('.next_p1'),
              centerPadding: '0px',
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: false,
              centerMode:true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// ------------------------ Product Slider Two
        if($(".product_slider_two").length) {
          $('.product_slider_two').slick({
              dots: false,
              arrows: false,
              centerPadding: '0px',
              slidesToShow: 4,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 3
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1
                  }
                }
              ]
            });
        }


// -------------------- Remove Placeholder When Focus Or Click
        $("input,textarea").each( function(){
            $(this).data('holder',$(this).attr('placeholder'));
            $(this).on('focusin', function() {
                $(this).attr('placeholder','');
            });
            $(this).on('focusout', function() {
                $(this).attr('placeholder',$(this).data('holder'));
            });     
        });


// -------------------------- Doc Sidebar
        var subMenu = $ (".doc-sidebar ul li.dropdown-holder>h4"),
            secSubMenu = $ (".doc-sidebar .sec-menu"),
            expender = $ (".doc-sidebar ul li.dropdown-holder .expander");
            subMenu.on("click", function (e) {
              e.preventDefault();
            });

            subMenu.append(function () {
              return '<span class="expander"><i class="fa fa-chevron-down" aria-hidden="true"></i></span>';
            });

            subMenu.on('click', function () {
              if ( $(this).parent('li').children('ul').hasClass('show') ) {
                $(this).parent('li').children('ul').removeClass('show');
                } else {
                $('.sub-menu.show').removeClass('show');
                $(this).parent('li').children('ul').addClass('show');    
                };
            });

            secSubMenu.on('click', function () {
              if ( $(this).parent('li').children('ul').hasClass('open') ) {
                $(this).parent('li').children('ul').removeClass('open');
                } else {
                $('.sub-menu.open').removeClass('open');
                $(this).parent('li').children('ul').addClass('open');    
                };
            });

// -------------------------- Accordion
        var subMenu = $ (".card .card-header");
            subMenu.on("click", function (e) {
              e.preventDefault();
            });


            subMenu.on('click', function () {
              if ( $(this).parent('.card').children('.collapse').hasClass('show') ) {
                $(this).parent('.card').children('.collapse').removeClass('show');
                } else {
                $('.collapse.show').removeClass('show');
                $(this).parent('.card').children('.collapse').addClass('show');    
                };
            });

// -------------------------- scroll animate
        if($(".main-side-nav").length) {
          $('.main-side-nav a').on('click', function(){
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
              var target = $(this.hash);
              target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
              if (target.length) {
                $('html, body').animate({
                  scrollTop: (target.offset().top - 100)
                }, 800);
                return false;
              }
            }
          });
        }


// -------------------------- Mobile Nav
if (document.querySelector(".theme-main-menu")) {
  // Add event listener to the navbar toggler button
  document.querySelector('.theme-main-menu .navbar-toggler').addEventListener('click', function() {
      // Toggle the "show" class on the navbar-collapse element
      document.querySelector(".navbar-collapse").classList.toggle("show");
      // Toggle the "open" class on the navbar-toggler button
      this.classList.toggle("open");
  });

  // Add event listener to the dropdown-toggle buttons
  document.querySelectorAll('.dropdown-menu .dropdown-toggle').forEach(function(element) {
      // Add click event listener to each dropdown-toggle button
      element.addEventListener('click', function(e) {
          // Check if the next sibling element does not have the "show" class
          if (!this.nextElementSibling.classList.contains('show')) {
              // Remove the "show" class from all dropdown menus within the same dropdown-menu container
              this.closest('.dropdown-menu').querySelectorAll('.show').forEach(function(element) {
                  element.classList.remove("show");
              });
          }
          // Toggle the "show" class on the next sibling element (dropdown-menu)
          this.nextElementSibling.classList.toggle('show');
          // Prevent default behavior of the event
          e.preventDefault();
      });
  });
}
$('#one-page-nav .nav-link').on('click', function(){
  $('.navbar-collapse').removeClass('show');
  $('.navbar-toggler').removeClass("open");
});

// Mobile Doc Side Nav
if($(".doc-sidebar").length) {
  $('.doc-sidebar .btn').on('click', function(){
    $(".doc-links").toggleClass("show");
  });
}


// -------------------------- Sidebar Menu
        if($(".main-sidebar-nav").length) {
          $('.sidebar-nav-button').on('click', function(){
            $(".main-sidebar-nav").addClass("show");
          });
          $('.main-sidebar-nav .close-btn').on('click', function(){
            $(".main-sidebar-nav").removeClass("show");
          });
        }

// ------------------------ Product Quantity Selector
        if ($(".product-value").length) {
            $('.value-increase').on('click',function(){
              var $qty=$(this).closest('ul').find('.product-value');
              var currentVal = parseInt($qty.val());
              if (!isNaN(currentVal)) {
                  $qty.val(currentVal + 1);
              }
          });
          $('.value-decrease').on('click',function(){
              var $qty=$(this).closest('ul').find('.product-value');
              var currentVal = parseInt($qty.val());
              if (!isNaN(currentVal) && currentVal > 1) {
                  $qty.val(currentVal - 1);
              }
          });
        }

// ------------------------ Credit Card Option 
        if($("#credit-card").length) {
          $(".payment-radio-button").on('click',function(){
             if ($("#credit-card").is(":checked")) {
               $(".credit-card-form").show(300);
             } else {
               $(".credit-card-form").hide(300);
             }
           });
        }

// -------------------------- JS tilt Effect
        if($(".js-tilt").length) {
          $('.js-tilt').tilt({
              glare: true,
              maxGlare: .3
          })
        }
        
// --------------------------------- Contact Form
          // init the validator
          // validator files are included in the download package
          // otherwise download from http://1000hz.github.io/bootstrap-validator

        if($("#contact-form").length) {
            $('#contact-form').validator();
            // when the form is submitted
            $('#contact-form').on('submit', function (e) {

                // if the validator does not prevent form submit
                if (!e.isDefaultPrevented()) {
                    var url = "inc/contact.php";

                    // POST values in the background the the script URL
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: $(this).serialize(),
                        success: function (data)
                        {
                            // data = JSON object that contact.php returns

                            // we recieve the type of the message: success x danger and apply it to the
                            var messageAlert = 'alert-' + data.type;
                            var messageText = data.message;

                            // let's compose Bootstrap alert box HTML
                            var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';

                            // If we have messageAlert and messageText
                            if (messageAlert && messageText) {
                                // inject the alert to .messages div in our form
                                $('#contact-form').find('.messages').html(alertBox);
                                // empty the form
                                $('#contact-form')[0].reset();
                            }
                        }
                    });
                    return false;
                }
            });
          }

    
    $(window).on ('load', function (){ // makes sure the whole site is loaded

// -------------------- Site Preloader
        $('#ctn-preloader').fadeOut(); // will first fade out the loading animation
        $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
        $('body').delay(350).css({'overflow':'visible'});



// ------------------------------- AOS Animation
        if ($("[data-aos]").length) { 
            AOS.init({
            duration: 1000,
            mirror: true
          });
        }
        
// ------------------------------------- Fancybox
        var fancy = $ (".fancybox");
        if(fancy.length) {
          fancy.fancybox({
            arrows: true,
            buttons: [
              "zoom",
              //"share",
              "slideShow",
              //"fullScreen",
              //"download",
              "thumbs",
              "close"
            ],
            animationEffect: "zoom-in-out",
            transitionEffect: "zoom-in-out",
          });
        }


// ------------------------------- AOS Animation
        if ($(".map-canvas").length) { 
            var map = new google.maps.Map($(".map-canvas")[0], {
                zoom: 14,
                center: new google.maps.LatLng(40.72, -74),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                clickableIcons: false
            });

            var marker = new google.maps.Marker({
                map: map,
                draggable: true,
                position: new google.maps.LatLng(40.72, -74),
                visible: true
            });
        }

    });  //End On Load Function
    
  })();
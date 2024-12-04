import { Component, OnInit,HostListener } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public modalService: ModalService,) { }

  ngOnInit(): void {
    function headerCampaignRemove(): void {
      document.body.addEventListener('click', function (event) {
        const button = event.target as HTMLElement;
    
        if (button.classList.contains('remove-campaign')) {
          const targetElem = document.querySelector('.header-top-campaign') as HTMLElement;
    
          if (targetElem) {
            targetElem.style.transition = 'opacity 1s ease';
            targetElem.style.opacity = '0';
    
            setTimeout(() => {
              if (targetElem.parentElement) {
                targetElem.parentElement.removeChild(targetElem);
              }
            }, 1000);
          }
        }
      });
    }
    
    
    
    // Ensure the DOM has fully loaded before attaching the event listener
    document.addEventListener('DOMContentLoaded', () => {
      headerCampaignRemove();
    });
  }
  isSticky = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isSticky = window.pageYOffset > 150;
  }
  showLoginModal(event: Event): void {
    event.preventDefault();
    this.modalService.showLoginModal();
  }
}

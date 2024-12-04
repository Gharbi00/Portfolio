import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    public modalService: ModalService,
  ) {
    
   }

  ngOnInit(): void {
    function headerCampaignRemove(): void {
      const removeCampaignButtons = document.querySelectorAll('.remove-campaign');
    
      removeCampaignButtons.forEach(button => {
        button.addEventListener('click', function() {
          const targetElem = document.querySelector('.header-top-campaign') as HTMLElement;
    
          if (targetElem) {
            targetElem.style.transition = 'opacity  1s ease';
    
            targetElem.style.opacity = '0';
    
            // Optionally, remove the element after the animation completes
            setTimeout(() => {
              targetElem.remove();
            },1000);
          }
        });
      });
    }
    
    // Ensure the DOM has fully loaded before attaching the event listener
    document.addEventListener('DOMContentLoaded', () => {
      headerCampaignRemove();
    });
  }
  showLoginModal(event: Event): void {
    event.preventDefault();
    this.modalService.showLoginModal();
  }

}

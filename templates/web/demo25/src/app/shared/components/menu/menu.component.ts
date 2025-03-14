import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public menuItems: Menu[];

  constructor(private router: Router, public navServices: NavService) {
    this.navServices.items.subscribe(menuItems => this.menuItems = menuItems );
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
    document.getElementById("toggleButton")?.addEventListener("click", this.handleClick.bind(this));
  }

  ngOnInit(): void {
  }

  mainMenuToggle(): void {
    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }
isClicked: boolean = false;

  handleClick(): void {
    this.isClicked = !this.isClicked;

   
    const element = document.getElementById("dropdownnav");

    if (element) {

      element.style.display = this.isClicked ? "block" : "none";
    }
  
  
}}

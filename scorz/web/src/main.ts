import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Define a function to create and append the switch box



if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  // Immediately invoked function to set the theme on initial load
  // function setTheme(themeName: string) {
  //   localStorage.setItem('handout_theme', themeName);
  //   document.documentElement.className = themeName;
  // }
  
  // Function to toggle between light and dark theme

  


  
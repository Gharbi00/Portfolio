import Step from 'shepherd.js/src/types/step';

export const builtInButtons = {
  // complete: {
  //   classes: "complete-button",
  //   text: "Finish Tutorial",
  //   action: function() {
  //     return console.log('button clicked');
  //   }
  // },
  cancel: {
    classes: 'cancel-button',
    secondary: true,
    text: 'Skip',
    type: 'cancel',
  },
  next: {
    classes: '',
    text: 'Next',
    type: 'next',
  },
  back: {
    classes: 'back-button',
    secondary: true,
    text: 'Back',
    type: 'back',
  },
  finish: {
    classes: 'widget-btn widget-btn-primary',
    text: 'Thank you!',
    type: 'cancel',
  },
};

export const defaultStepOptions: Step.StepOptions = {
  classes: 'shepherd-theme-arrows custom-default-class',
  scrollTo: { behavior: 'smooth', block: 'center' },
  cancelIcon: {
    enabled: false,
  },
  canClickTarget: false,
};

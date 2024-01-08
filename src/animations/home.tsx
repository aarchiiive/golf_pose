import { animate } from "framer-motion";

export const visibleVariants = {
  hidden: {
    opacity: 0,
  },
  initial: {
    y: '0',
    opacity: 1,
  },
  buttonInitial: {
    y: '10vh',
    opacity: 0,
  },

  animateFadeIn: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },
  animateFadeOut: {
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },

  buttonFadeIn: {
    y: '0',
    opacity: 1,
    transition: {
      duration: 1.6,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },  
  buttonFadeOut: {
    y: '10vh',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },

  exitTop: {
    y: '-10vh',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
  exitBottom: {
    y: '10vh',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' }
  }
};
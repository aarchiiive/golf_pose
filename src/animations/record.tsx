export const visibleVariants = {
  titleFadeIn: {
    y: '-10vh',
    opacity: 0,
  },
  buttonFadeIn: {
    y: '10vh',
    opacity: 0,
  },
  containerFadeIn: {
    opacity: 0,
  },

  titleFadeOut: {
    y: '-10vh',
    opacity: 1,
  },
  buttonFadeOut: {
    y: '10vh',
    opacity: 1,
  },

  containerFadeOut: {
    opacity: 1,
  },

  animateFadeIn: {
    y: '0',
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },

  animateFadeOut: {
    y: '0',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },
};

export const previewVariants = {
  hidden: {
    x: '100vw',
    opacity: 0,
  },

  containerFadeIn: {
    x: '100vw',
    opacity: 0,
  },
  containerFadeOut: {
    x: '0',
    opacity: 1,
  },

  animateFadeIn: {
    x: '0',
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },
  animateFadeOut: {
    x: '-100vw',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },
  animateRetryFadeOut: {
    x: '100vw',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  },
};
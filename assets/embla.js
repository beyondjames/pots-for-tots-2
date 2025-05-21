console.log('embla.js script loaded');

const addThumbBtnsClickHandlers = (emblaApiMain, emblaApiThumb) => {
  const slidesThumbs = emblaApiThumb.slideNodes();

  const scrollToIndex = slidesThumbs.map((_, index) => () => emblaApiMain.scrollTo(index));

  slidesThumbs.forEach((slideNode, index) => {
    slideNode.addEventListener('click', scrollToIndex[index], false);
  });

  return () => {
    slidesThumbs.forEach((slideNode, index) => {
      slideNode.removeEventListener('click', scrollToIndex[index], false);
    });
  };
};

const addToggleThumbBtnsActive = (emblaApiMain, emblaApiThumb) => {
  const slidesThumbs = emblaApiThumb.slideNodes();

  const toggleThumbBtnsState = () => {
    emblaApiThumb.scrollTo(emblaApiMain.selectedScrollSnap());
    const previous = emblaApiMain.previousScrollSnap();
    const selected = emblaApiMain.selectedScrollSnap();
    slidesThumbs[previous].classList.remove('embla-thumbs__slide--selected');
    slidesThumbs[selected].classList.add('embla-thumbs__slide--selected');
  };

  emblaApiMain.on('select', toggleThumbBtnsState);
  emblaApiThumb.on('init', toggleThumbBtnsState);

  return () => {
    const selected = emblaApiMain.selectedScrollSnap();
    slidesThumbs[selected].classList.remove('embla-thumbs__slide--selected');
  };
};

const OPTIONS = {};
const OPTIONS_THUMBS = {
  containScroll: 'keepSnaps',
  dragFree: true,
};

const carousels = document.querySelectorAll('.embla');
carousels.forEach((carousel) => {
  const viewportNodeMainCarousel = carousel.querySelector('.embla__viewport');
  const viewportNodeThumbCarousel = carousel.querySelector('.embla-thumbs__viewport');
  const emblaApiMain = EmblaCarousel(viewportNodeMainCarousel, OPTIONS);
  const emblaApiThumb = EmblaCarousel(viewportNodeThumbCarousel, OPTIONS_THUMBS);

  const removeThumbBtnsClickHandlers = addThumbBtnsClickHandlers(emblaApiMain, emblaApiThumb);
  const removeToggleThumbBtnsActive = addToggleThumbBtnsActive(emblaApiMain, emblaApiThumb);

  emblaApiMain.on('destroy', removeThumbBtnsClickHandlers).on('destroy', removeToggleThumbBtnsActive);

  emblaApiThumb.on('destroy', removeThumbBtnsClickHandlers).on('destroy', removeToggleThumbBtnsActive);
});

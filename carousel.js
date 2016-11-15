/**
 * TODO:
 * ----
 * 1) 'Infinite' functionality should be configurable.
 * 2) Don't hard code the pagination.
 * 3) Autoplay?
 * 4) This relies on the browser supporting flexbox. What should we do for legacy browsers? :/
 * 5) touch/swipe support.
 */

class Carousel {
    constructor(carousel) {
        const selectors = {
            carousel: 'js-carousel',
            slide: 'js-carousel-slide',
            slideWrapper: 'js-carousel-slides',
            nav: 'js-carousel-nav',
            pagination: 'js-carousel-pagination'
        };

        this.selectors = selectors;

        // Cache the carousel node.
        this.carousel = carousel;

        // Get the slide wrapper (The transitions and positioning to
        // give the carousel effect are applied to this).
        this.slideWrapper = carousel.getElementsByClassName(this.selectors.slideWrapper)[0];

        // Cache the slides.
        this.slides = carousel.getElementsByClassName(this.selectors.slide);

        // If there isn't more than 1 slide then assuming we don't need
        // a carousel.
        if(this.slides.length < 2) {
            console.info('Carousel: Not enough slides. Exiting.');
            return;
        }

        // Cache the prev/next navigation nodes.
        this.navigation = carousel.getElementsByClassName(this.selectors.nav);

        // Cache the pagination
        this.pagination = carousel.getElementsByClassName(this.selectors.pagination);

        this.currentRef = this.slides.length - 1;
        this.currentIndex = 0;

        // Intialise the carousel.
        this.init();
    }

    /**
     * Ran when the Carousel instance is created.
     * Currently a bit redundant but it's sort of neat(ish).
     *
     * The `push` class removes the CSS transform so that the
     * first slide in the order stack is pushed outside the
     * viewport (ensures slide in view always has a slide
     * either side).
     */
    init() {
        this.slideWrapper.classList.add('push'); // [1]

        this.setOrder();
        this.attachEvents();
    }

    /**
     * 1. Prev/Next click handler.
     * 2. Slide Pagination click handler.
     */
    attachEvents() {
        // [1]
        [].forEach.call(this.navigation, nav => {
            nav.addEventListener('click', e => {
                e.preventDefault();

                let dir = e.currentTarget.getAttribute('data-dir');
                this['move' + dir]();
            });
        });

        // [2]
        [].forEach.call(this.pagination, el => {
            el.addEventListener('click', e => {
                e.preventDefault();

                let index = e.currentTarget.getAttribute('data-index');

                this.paginate(index);
            });
        });
    }

    /**
     * Set the flex `order` property for each of the slides.
     * This will loop through each of the slides starting at
     * the index of the current slide.
     *
     * @param {int} offset [slide index to start the loop at]
     */
    setOrder() {
        let offset = this.currentRef;

        for(let i = 0; i < this.slides.length; i++) {
            let pointer = (i + offset) % this.slides.length;

            this.slides[pointer].style.order = i + 1;
        }
    }

    /**
     * Move to the next slide.
     *
     * Determines the index of the slide to move to. If there's a slide
     * after the current one, move to that. If not, go to the first.
     */
    moveNext() {
        let next = this.currentIndex + 1;
        let index = this.slides[next] ? next : 0;

        this.moveToIndex(index);
    }

    /**
     * Move to the previous slide.
     *
     * Determines the index of the slide to move to. If there's a slide
     * before the current one, move to that. If not, move to the last.
     */
    movePrev() {
        let prev = this.currentIndex - 1;
        let index = this.slides[prev] ? prev : this.slides.length - 1;

        this.moveToIndex(index, 'prev');
    }

    /**
     * Update the current index and the flex `order` prop
     * for the slides.
     *
     * @param  {int} index
     */
    moveToIndex(index, dir = 'next') {
        this.slideWrapper.setAttribute('data-dir', dir);

        this.currentRef = (index === 0 ?  this.slides.length - 1 : index - 1);
        this.currentIndex = index;

        this.setOrder();

        // Update the CSS classes on the slide wrapper for the
        // transition and transforms.
        this.slideWrapper.classList.remove('push');

        setTimeout(() => {
            this.slideWrapper.classList.add('push');
        }, 50);
    }

    /**
     * Handler for the pagination click event.
     * @param  {int} index
     */
    paginate(index) {
        let i = parseInt(index, 10);

        if(i === this.currentIndex) {
            return;
        }

        this.moveToIndex(i, (i < this.currentIndex ? 'prev' : 'next'));
    }
}

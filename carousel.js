/**
 * TODO:
 * ----
 * 1) 'Infinite' functionality should be configurable, MAYBE? who even knows.
 * 2) Autoplay?
 * 3) This relies on the browser supporting flexbox. What should we do for legacy browsers? :/
 * 4) touch/swipe support.
 * 5) Pagination transition (e.g. going from 4 to 1) looks weird.
 */

class Carousel {
    constructor(carousel, options) {
        const selectors = {
            carousel: 'js-carousel',
            slide: 'js-carousel-slide',
            slideWrapper: 'js-carousel-slides',
            nav: 'js-carousel-nav'
        };

        // Define the default Carousel config options.
        //
        // 1. Delay (seconds) between slide transitions.
        const defaults = {
            pagination: true,
            autoplay: true,
            autoplayDelay: 5 // [1]
        };

        this.options = Object.assign({}, defaults, options);
        this.selectors = selectors;

        // Cache the carousel node.
        this.carousel = carousel;

        // Get the slide wrapper (The transitions and positioning to
        // give the carousel effect are applied to this).
        this.slideWrapper = carousel.getElementsByClassName(this.selectors.slideWrapper)[0];

        // Cache the slides.
        this.slides = carousel.getElementsByClassName(this.selectors.slide);

        // If there isn't more than 1 slide then assuming we don't need
        // a carousel?
        if(this.slides.length < 2) {
            console.info('Carousel: Not enough slides. Exiting.');
            return;
        }

        // Cache the prev/next navigation nodes.
        this.navigation = carousel.getElementsByClassName(this.selectors.nav);

        this.currentRef = this.slides.length - 1;
        this.currentIndex = 0;
        this.timer = null;

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

        if(this.options.pagination) {
            this.buildPagination();
        }

        if(this.options.autoplay) {
            this.startTimer();
        }
    }

    /**
     * Create the Pagination node, append it to the
     * carousel and bind the click event for each one.
     */
    buildPagination() {
        let ol = document.createElement('ol');
        ol.classList.add('carousel-pagination');

        this.carousel.appendChild(ol);

        [].forEach.call(this.slides, (slide, index) => {
            let li = document.createElement('li');
            li.innerHTML = `<button data-index="${index}">${index + 1}</button>`;

            li.addEventListener('click', () => this.paginate(index));

            ol.appendChild(li);
        });
    }

    /**
     * 1. Prev/Next click handler.
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
        this.stopTimer();

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
        this.stopTimer();

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
            this.slideChanged();
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

    /**
     * Called after the slide has changed (and the transition is complete -
     * I think).
     */
    slideChanged() {
        if(this.options.autoplay) {
            this.startTimer();
        }
    }

    /**
     * Start the autoplay timeout. This should be called after a slide
     * has been changed.
     */
    startTimer() {
        this.timer = window.setTimeout(() => {
            this.moveNext();
        }, this.options.autoplayDelay * 1000);
    }

    /**
     * Reset/Clear the autoplay timeout. This should be called before
     * a slide is changed, I think!
     */
    stopTimer() {
         window.clearTimeout(this.timer);
    }
}

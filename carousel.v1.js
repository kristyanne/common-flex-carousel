/**
 * TODO:
 * ----
 * 1) 'Infinite' functionality should be configurable.
 * 2) 'Pagination' element should be configurable.
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
        // TODO: Nav should be related to the carousel.
        this.navigation = carousel.getElementsByClassName(this.selectors.nav);

        // Cache the pagination
        // TODO: should be configurable, carousel might not have one?
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

        this.attachEvents();
        this.moveToIndex(this.currentRef);
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
            this.slides[pointer].classList.remove('offset');

            if(i === 0) {
                this.slides[pointer].classList.add('offset');
            }
        }
    }

    /**
     * Move to the next slide.
     *
     * Determines the index of the slide to move to. If there's a slide
     * after the current one, move to that. If not, go to the first.
     */
    moveNext() {
        let next = this.currentRef + 1;
        let index = this.slides[next] ? next : 0;

        this.slideWrapper.setAttribute('data-dir', 'next');
        this.moveToIndex(index);
    }

    /**
     * Move to the previous slide.
     *
     * Determines the index of the slide to move to. If there's a slide
     * before the current one, move to that. If not, move to the last.
     */
    movePrev() {
        let prev = this.currentRef - 1;
        let index = this.slides[prev] ? prev : this.slides.length - 1;

        this.slideWrapper.setAttribute('data-dir', 'prev');
        this.moveToIndex(index);
    }

    /**
     * Update the current index and the flex `order` prop
     * for the slides.
     *
     * @param  {int} index
     */
    moveToIndex(index) {
        this.currentRef = index;
        this.setOrder();

        // Update the index of the slide currently in view.
        let i = index + 1;
        this.currentIndex = (i === this.slides.length ? 0 : i);

        let balls = i - 1;

        // Update the CSS classes on the slide wrapper for the
        // transition and transforms.
        this.slideWrapper.classList.remove('push');

        setTimeout(() => {
            this.slideWrapper.classList.add('push');

            // REMOVE.
            document.getElementById('offset').innerHTML = 'Offset Index: ' + this.currentRef;
            document.getElementById('current').innerHTML = 'Visible Slide Index: ' + this.currentIndex;
            document.getElementById('test').innerHTML = 'Test Offset Index: ' + balls;
        }, 50);
    }

    paginate(index) {
        let i = parseInt(index, 10);

        // if(i === this.currentRef) {
        //     console.info('Carousel: Currently on the selected slide. Exiting.');
        //     return;
        // }

        // this['move' + (this.currentRef > index ? 'Prev' : 'Next')]();
    }
}

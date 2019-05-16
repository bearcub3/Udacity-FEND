/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */

/* We're placing all of our tests within the $() function,
 * since some of these tests may require DOM elements. We want
 * to ensure they don't run until the DOM is ready.
 */
$(function() {
    /* This is our first test suite - a test suite just contains
    * a related set of tests. This suite is all about the RSS
    * feeds definitions, the allFeeds variable in our application.
    */
    describe('RSS Feeds', function() {


        it('are defined', function() {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });

        it('contains URL', function() {
            let feedUrl;
            for(let feed of allFeeds){
                feedUrl = feed.url;
                expect(feedUrl).toBeDefined();
                expect(feedUrl.length).toBeGreaterThan(0);
            }  
        });

        it('has its name', function() {
            let feedName;
            for(let feed of allFeeds){
                feedName = feed.name;
                expect(feedName).toBeDefined();
                expect(feedName.length).toBeGreaterThan(0);
            }
        });
    });


    describe('The menu', function() {

        it('is hidden by default', function() {
            expect($('body').hasClass('menu-hidden')).toBeTruthy();
        });

         it('changes visibility when its clicked', function() {
            $('.menu-icon-link').trigger('click');
            expect($('body').hasClass('menu-hidden')).toBe(false);
            $('.menu-icon-link').trigger('click');
            expect($('body').hasClass('menu-hidden')).toBe(true);
         });
    });

    describe('Initial Entries', function(){
        beforeEach(function(done){
            loadFeed(0, function(){
                done();
            });
        });

        it('completes its work and has a single entry element in feed container', function(){
            expect($('.feed .entry').length).toBeGreaterThan(0);
        });
    });
    
    describe('New Feed Selection', function(){
        let prevFeed,
            newFeed;

        beforeEach(function(done){
            loadFeed(0, function(){
                prevFeed = $('.feed').html();
                loadFeed(1, function(){
                    newFeed = $('.feed').html();
                    done();
                });
            });
        });

        it('has loaded a new feed and its content has made changes', function(){
            expect(prevFeed).not.toEqual(newFeed);
        });
    });
}());
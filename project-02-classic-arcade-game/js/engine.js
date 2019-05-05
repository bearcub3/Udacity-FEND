/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
    const doc = global.document,
          win = global.window,
          canvas = doc.createElement('canvas'),
          ctx = canvas.getContext('2d');


    let lastTime,
        stopTime,
        // duration is for total seconds a game was played for
        duration = 0,
        // timeToPlay hits 0, the game ends
        timeToPlay,
        animeRequest,
        /* All the event handlers with keys are bound to the document.
           They were activated even though they shouldn't have been.
           To activate them in the precise situation, I had to bind some of them
           to the variable. */
        keysLock = false;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();
        // the game ends if a player runs out of lives or the time expires.
        if(gamePlayer.lives === 0 || timeToPlay === 0){
            gameEnd();
        }

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        //win.requestAnimationFrame(main);

        animeRequest = win.requestAnimationFrame(main) ||
                       win.webkitRequestAnimationFrame(main) ||
                       win.mozRequestAnimationFrame(main) ||
                       win.oRequestAnimationFrame(main) ||
                       win.msRequestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        gameCharactersChoice();
    }

    /* This function helps a player choose a game character with arrow keys before a game starts */
    function gameCharactersChoice(){
        
        let characters = [
            'images/char-boy.png',  
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png',
        ];

        const selector = {
            sprite: 'images/selector.png',
            // the initial position of the selector
            row: 3,
            col: 2
        }; 

        gameInit(characters, selector);

        // the initial game screen with the selection of the characters, induction and the title.
        function gameInit(characters, selector){
            keysLock = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
                
            ctx.fillStyle = 'limegreen';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            ctx.font = '30pt sans-serif';
            ctx.fillStyle = 'yellow';

            const welcome = 'JS Arcade Game';
            ctx.fillText(welcome, canvas.width/2, canvas.height/2 - 200);

            ctx.font = '15pt sans-serif';
            ctx.fillStyle = 'white';

            const intro1 = 'Pick your character with arrow keys';
            ctx.fillText(intro1, canvas.width/2, canvas.height/2 - 100);
            const intro2 = 'and then press Enter!'; 
            ctx.fillText(intro2, canvas.width/2, canvas.height/2 - 70);

            ctx.drawImage(Resources.get(selector.sprite), selector.col*101, selector.row*83+10);
            
            for (var i=0;i<characters.length;i++) {
                ctx.drawImage(Resources.get(characters[i]), i*101, 3*83);
            }
        }

        document.addEventListener('keyup', keyControl);

        function keyControl(e){
            if(keysLock){
                if (e.keyCode === 37 && selector.col > 0) {
                    selector.col -= 1;
                    gameInit(characters, selector);
                } else if (e.keyCode === 39 && selector.col < 4) {
                    selector.col += 1;
                    gameInit(characters, selector);
                } else if (e.keyCode === 13) {
                    clearTimeout(stopTime);
                    gamePlayer.sprite = characters[selector.col];
                    gamePlayer.x = 200;
                    gamePlayer.y = 380;
                    countdown(40);
                    main();
                }
            }
        }
    }

    // This is for checking Collisions of two items.
    function checkCollisions(){
        // the extent of the collision of the two items between a game player and a bug(enemy)
        gameObstacle.forEach(function(enemy){
            if((gamePlayer.playerPos[1]+20) === enemy.enemyPos[1]){
                if(gamePlayer.playerPos[0] >= (enemy.enemyPos[0]-35) && gamePlayer.playerPos[0] <= (enemy.enemyPos[0]+35)){
                    gamePlayer.x = gamePlayer.initPos.x;
                    gamePlayer.y = gamePlayer.initPos.y;
                    gamePlayer.lives--;
                    livesView.textContent = gamePlayer.lives;
                }
            }
        });

        // depending on which item a player get, a player can win more points or lives.
        gemItems.forEach(function(gem){
            if(gamePlayer.playerPos[0] === gem.x){
                if((gamePlayer.playerPos[1]+25) >= gem.y && (gamePlayer.playerPos[1]-25) <= gem.y){
                    if(gem.sprite === 'images/Heart.png'){
                        gamePlayer.lives += 1;
                        livesView.textContent = gamePlayer.lives;
                    } else if(gem.sprite === 'images/Gem Blue.png'){
                        game.point += 10;
                        scoreView.textContent = game.point;
                    } else if(gem.sprite === 'images/Gem-Orange.png' || 'images/Gem Green.png'){
                        game.point += 5;
                        scoreView.textContent = game.point;
                    }
                    gem.gemGenerator();
                }
            }
        });
 
        /* when a player gets a star, the game is extended for extra 10 seconds each time. 
           and a star will appear almost every 6 seconds. */
        if(gamePlayer.playerPos[0] === star.x){
            if((gamePlayer.playerPos[1]+25) >= star.y && (gamePlayer.playerPos[1]-25) <= star.y){
                star.x = -100;
                star.y = -100;
                addTime(10);
                setTimeout(function(){
                    star.starGenerator();
                }, 6000);
                
                function addTime(seconds){
                    clearTimeout(stopTime);
                    countdown.call(this.sec, seconds);
                    sec = this.sec + seconds;
                    timeToPlay = sec;
                }
            }
        }
    }

    // game countdown timer
    function countdown(seconds) {
        this.sec = seconds;
        this.mins = seconds > 60? seconds/60 : 0;
        timeToPlay = seconds;

        let passed = false; 
        
        tick();

        function tick() {
            passed = false; 
            if(this.sec > 60){
                this.current_minutes = mins-1;
            }
            this.sec--;
            timeToPlay--;
            timeView.textContent = (!this.mins? '00' : this.current_minutes.toString()) + ':' + (this.sec < 10 ? '0' : '') + String(this.sec);
            if( this.sec > 0 ) {
                stopTime = setTimeout(tick, 1000);
                passed = true;
                if(passed){
                    duration++;
                }
            } else {
                if(this.mins > 1){
                    countdown(this.mins-1);           
                }
            }
        }
    }

    /* game ending */
    function gameEnd(){
        keysLock = false;
        clearTimeout(stopTime);
        document.addEventListener('keyup', initGame);
        setTimeout(function(){
            cancelAnimationFrame(animeRequest)
        }, 200);

        ctx.clearRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.font = '45pt sans-serif';
        ctx.fillStyle = 'yellow';
        const ending = 'The End';
        ctx.fillText(ending, canvas.width/2, canvas.height/2 - 200);
        ctx.drawImage(Resources.get('images/Star.png'), this.x, this.y);
        
        ctx.font = '20pt sans-serif';
        ctx.fillStyle = 'white';

        // depending on game score, different words are shown.
        if(game.point < 100){
            let encouragement = 'Good Try!';
            ctx.fillText(encouragement, canvas.width/2, canvas.height/2 - 50);
        } else if(game.point > 100 && game.point < 250){
            let goodWork = 'Great! Can you beat your score?';
            ctx.fillText(goodWork, canvas.width/2, canvas.height/2 - 50);
        } else if(game.point > 250){
            let godLevel = 'You deserve a standing ovation!';
            ctx.fillText(godLevel, canvas.width/2, canvas.height/2 - 50);
        }
        // showing that how many seconds a player played a game
        let gameDuration = `You played this game for ${duration} seconds.`;
        ctx.fillText(gameDuration, canvas.width/2, canvas.height/2 - 130);
        // showing that how many points a player earned in a game
        let gamePoints = `You've earned total ${game.point} points.`;
        ctx.fillText(gamePoints, canvas.width/2, canvas.height/2 - 90);
        // telling a player to use space key to play a game again
        let replay = 'Press Space key to play again!';
        ctx.fillText(replay, canvas.width/2, canvas.height/2 + 10);
    }
    
    function initGame(e){
        if(e.keyCode === 32){
            init();
        }
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        gameObstacle.forEach( obstacle => obstacle.update(dt));
        gamePlayer.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/stone-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        gameObstacle.forEach(obstacle => obstacle.render());
        gamePlayer.render();
        gemItems.forEach(gem => gem.render());
        star.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        duration = 0;
        game.point = 0;
        gamePlayer.lives = 3;
        gameObstacle.forEach(obstacle => obstacle.reset);
        gemItems.forEach(gem => gem.gemGenerator());
        star.starGenerator();
        livesView.textContent = gamePlayer.lives;
        scoreView.textContent = game.point;
        timeView.textContent = '00:00';
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-backwards.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/selector.png',
        'images/Gem-Orange.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Heart.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
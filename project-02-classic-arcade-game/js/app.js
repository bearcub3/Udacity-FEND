let livesView = document.querySelector('.game-lives-score');
let scoreView = document.querySelector('.game-points-score');
let speedInterval;

const Game = function(){
    this.width = 505;
    this.height = 606;
    this.point = 0;
}

Game.prototype.update = function(){
    
}

// Enemies our player must avoid
const Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.startingPoint = x;
    this.enemyPos;
    this.x < 0 ? this.sprite = 'images/enemy-bug.png' : this.sprite = 'images/enemy-bug-backwards.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if(this.startingPoint > game.width && this.x < -100){
        this.x = this.startingPoint;
    }else if(this.startingPoint < 0 && this.x > game.width){
        this.x = this.startingPoint;
    }

    this.enemyPos = [];
    this.enemyPos.push(this.x, this.y);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
const Player = function(){
    this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 380;
    this.initPos = {x: 200, y: 380};
    this.playerPos;
    this.lives = 3;
};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.update = function(){
    this.playerPos = [];
    this.playerPos.push(this.x, this.y);
    //console.log(this.playerPos);
}

Player.prototype.handleInput = function(key){
    // character moves in a direction which a user controls arrow keys
    // left and right 
    switch (key){
        case 'left' :
            //console.log('left');
            if(this.x > 0){  
                this.x -= 100;
            }
            break;
        case 'right' :
            //console.log('right');
            if(this.x < 400){
                this.x += 100; 
            }
            break;
        case 'up' :
            //console.log('up');
            if(this.y > -45){
                this.y -= 85;
            }
            break;
        case 'down' :
            //console.log('down');
            if(this.y < 380){
                this.y += 85;
            }
            break;
    }
}

const PointItem = function() {
    this.gemGenerator();
}

PointItem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

PointItem.prototype.gemGenerator = function() {
    const gems = {
        gem: ['images/Gem-Orange.png', 'images/Gem Blue.png', 'images/Gem Green.png', 'images/Heart.png'],
        x: [0, 100, 200, 300, 400],
        y: [60, 140, 220, 310]
    };

    let gemSelection = gems['gem'][Math.floor(Math.random() * 4)],
        xPos = gems['x'][Math.floor(Math.random() * 5)],
        yPos = gems['y'][Math.floor(Math.random() * 4)];

    this.sprite = gemSelection;
    this.x = xPos;
    this.y = yPos;
}

const speedControl = function(){
    this.sprite = 'images/Star.png';
    this.starGenerator();
}

speedControl.prototype.update = function(){
    
}

speedControl.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

speedControl.prototype.starGenerator = function(){
    const star = {
        x: [0, 100, 200, 300, 400],
        y: [60, 140, 220, 310]
    };
    const self = this;

    let xPos = star['x'][Math.floor(Math.random() * 5)],
        yPos = star['y'][Math.floor(Math.random() * 4)];
    
    speedInterval = setInterval(function(){
        self.x = xPos;
        self.y = yPos;
    }, 6000);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const gameChars = (function(global){
    let allEnemies = [],
        allGems = [];

    const enemy1 = new Enemy(-80, 60, 150);
    const enemy2 = new Enemy(750, 60, -390);
    const enemy3 = new Enemy(-220, 145, 450);
    const enemy4 = new Enemy(250, 145, -150);
    const enemy5 = new Enemy(350, 230, -350);
    const enemy6 = new Enemy(-200, 230, 510);
    const enemy7 = new Enemy(-50, 315, 110);
    const enemy8 = new Enemy(750, 315, -410);
    const player = new Player();
    const gemItem = new PointItem();
    const gemItem2 = new PointItem();

    allEnemies.push(enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, enemy8);
    allGems.push(gemItem, gemItem2);

    return {
        enemyList : function(){
            return allEnemies;
        },
        playerList : function(){
            return player;
        },
        gemList : function(){
            return allGems;
        }
    }
})(this);

const game = new Game();
const gamePlayer = gameChars.playerList();
const gameObstacle = gameChars.enemyList();
const gemItems = gameChars.gemList();
const speed = new speedControl();

livesView.textContent = gamePlayer.lives;
scoreView.textContent = game.point;

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    gamePlayer.handleInput(allowedKeys[e.keyCode]);
});

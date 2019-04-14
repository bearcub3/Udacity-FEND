/* filename:    app.js
** project:     Udacity FEND - memory game
** author:      Go-Un Shin
*/

const t0 = performance.now();

const modal = selector('.modal'),
	  modalContainer = selector('.modal-container'),
	  modalClose = modalContainer.lastElementChild,
	  resetBTNmain = selector('.reset'),
	  resetBTNmodal = selector('.modal-reset'),
	  userNameInput = modalContainer.firstElementChild,
	  leaderboardTitle = selector('.leaderboard-title'),
	 // This array is for cards. Each string is based on the class names of the font-awesome icons and these are used for data-set as well.
	  cardDeck = [ 'kiwi-bird',
					'apple-alt',
					'bicycle',
					'candy-cane', 
					'cat',
					'dog',
					'hamburger',
					'pizza-slice' ];

let deckOfCards = document.querySelectorAll('.card'),
	cardList,
	newCardDeck,
	compareArr = [],
	firstFlip,
	secondFlip,
	showingInterval,
	flippingCards,
	move = 0,
	userRating,
	noMatch = false,
	totalPair = cardDeck.length,
	pairFound = 0,
	sec = 0,
	mins = 0,
	t,
	name,
	leaderBoard = [],
	rankingArr = [],
	newArrRank,
	noMoves = false;

function selector(el) {
	return document.querySelector(el);
}

function newEl(el) {
	return document.createElement(el);
}

// I didn't create each cards in HTML Markup. I created cards solely with JS, based on the length of the cardDeck array, instead.
function cardMaker(cardType) {
	const deckWrapper = newEl('ul'),
		  fragment = document.createDocumentFragment();

	deckWrapper.setAttribute('class', 'deck');
	selector('.wrapper').appendChild(deckWrapper);

	cardType.forEach(function(item) {
		const card = newEl('li');
		card.setAttribute('class', 'card');
		card.setAttribute('data-card',item);
		const icon = newEl('i');
		icon.setAttribute('class', 'fas fa-' + item);
		card.appendChild(icon);
		fragment.appendChild(card);
	});
	deckWrapper.appendChild(fragment);
}

// This function is for duplicating each card which is created by cardMaker function. 
function duplicate(items) {
	// Node.cloneNode([deep]);`, ` Node.appendChild();
	for (let item of items) {
		let parent = item.parentNode;
		let clonedItem = item.cloneNode(true);
		parent.insertBefore(clonedItem, item);
	}
}

/* --------------------------------------------------
other examples to make Array
cards = document.body.querySelectorAll('.card');
const cardList = Array.from(cards);
const cardList = Array.prototype.slice.call(cards); 
----------------------------------------------------- */

function cardShuffle(deck) {
	// to create new array to push the shuffled card which has the same length of the array in the parameter
	const newArr = deck.map(function() {
		return null;
	});

	// to create array index to refer [0,1,2,3...]
	const arrayRef = deck.map(function(item,idx) {
		return idx;
	});

	// to shuffle numbers in random order
	function randomize() {
		return Math.floor(Math.random() * arrayRef.length);
	}

	// to allocate random array to current array
	function newNum(item) {
		const randomIdx = randomize();
		//newArr[0] = arrayRef[5] = item;
		newArr[arrayRef[randomIdx]] = item;
		// to prevent repetitive number iteration
		arrayRef.splice(randomIdx, 1);
	}
	deck.forEach(newNum);
	return newArr;
}


// Shuffled Card replacement
// The previous cards should be removed before appending new shuffled cards.
function replaceCard(newArr, parent) {
	const els = parent.children;
	for (let arrO of els) {
		parent.removeChild(arrO);
		for (let arrN of newArr) {
			selector('.deck').appendChild(arrN);
		}
	}
}

/* ---------------------------------------------------------------------- 
	The rule of my memory game is slightly different compared to others.
	Please refer to readme.md for the detail of the instruction.
	This function is intended to remove the classes 'flipped' and 'show'
	and also to add an event listener to parent's element('.wrapper').
----------------------------------------------------------------------- */
function unshowingCard() {
	for (let card of newCardDeck) {
		card.classList.remove('flipped', 'show');
	}
	selector('.wrapper').addEventListener('click', memoryGame);
}

// When user flips a card....
function cardReveal(evt) {
	const gameCard = evt.target,
		  whichCard = gameCard.dataset.card;

	/*----------------------------------------------------------------------------------------
		Due to the event delegation of the card elements to the parent element('.wrapper')
		in order to minimize the unnecessary event listeners to each card element
		which would cause a costly operation, all the other elements inside of
		the parent element('.wrapper') were also clickable, and it threw an error
		while playing a game. This is to prevent such error.
	----------------------------------------------------------------------------------------*/
	if(noMoves || evt.target.nodeName === 'I' || gameCard.classList.contains('show') || evt.target.nodeName === 'UL') {
    	return;
    }

	gameCard.classList.add('flipped', 'show');

	// using Array and data-set to compare a set of two card flips
	if(compareArr.length === 0){
		firstFlip = gameCard;
		compareArr.push(whichCard);
	} else if(compareArr.length === 1) {
		secondFlip = gameCard;
		compareArr.push(whichCard);
		compareCard();
		// every two flips, the number of move increases by 1.
		move += 1;
	}
}

function moveCount() {
	// gameSetting move counting
	move > 1 ? selector('.move').textContent = 'Total ' + move + ' moves' : selector('.move').textContent = 'Total ' + move + ' move';
}

// to add CSS animation for unmatching cards
function noMatchingCard() {
	// to prevent cards from remaining clickable and throwing an error, I used the variable 'noMoves' with boolean data.
	noMoves = true;
	noMatch = true;
	firstFlip.classList.add('nomatched');
	secondFlip.classList.add('nomatched');
	selector('.alert').textContent = 'No Match! Try Again!';
	setTimeout(function(){
		firstFlip.classList.remove('nomatched', 'flipped' , 'show');
		secondFlip.classList.remove('nomatched', 'flipped' , 'show');
		noMoves = false;
	}, 500);
}

// to add CSS animation for matching cards
function matchingCard() {
	noMatch = false;
	// Once it reaches total 8, the game is completed.
	pairFound += 1;
	firstFlip.classList.add('matched');
	secondFlip.classList.add('matched');
	selector('.alert').textContent = 'Yay! Match Found!';
}

// Using the data-set, the two flipped cards are compared to see whether they are matching or not.
function compareCard() {
	let firstCard = compareArr[0], secondCard = compareArr[1];
	firstCard !== secondCard ? noMatchingCard() : matchingCard();
    compareArr = [];
}

function gameCompletion() {
	const modalMove = selector('.modal-move'),
		  modalTime = selector('.modal-timer');

	if(totalPair === pairFound){
		//console.log('Game Completed!');
		clearTimeout(t);
		selector('.wrapper').removeEventListener('click', memoryGame);
		selector('.modal').classList.add('visible');		  
		modalTime.textContent = `Total Time ${mins} : ${sec}`;
		modalMove.textContent = `Total ${move} Moves`;
		ratingGame(move);
		leaderBoard.push(modalTime.innerText);
		leaderBoard.push(modalMove.innerText);
	}	
}

function ratingGame(rate) {
	const ratingIndicator = selector('.rate').firstElementChild,
		  modalRatingIndicator = selector('.modal-rate').firstElementChild;

	if (rate == 8 || rate < 12) {
		ratingIndicator.textContent = 'Great Job!';
		modalRatingIndicator.textContent = 'Great Job!';
	} else if (12 == rate || rate < 16) {
		ratingIndicator.textContent = 'Good Job!';
		selector('.rate').lastElementChild.classList.add('invisible');
		modalRatingIndicator.textContent = 'Good Job!';
		selector('.modal-rate').lastElementChild.classList.add('invisible');
	} else if (16 == rate || rate > 16) {
		ratingIndicator.textContent = 'Nice Try!';
		selector('.rate').lastElementChild.previousElementSibling.classList.add('invisible');
		selector('.rate').lastElementChild.classList.add('invisible');
		modalRatingIndicator.textContent = 'Nice Try!';
		selector('.modal-rate').lastElementChild.previousElementSibling.classList.add('invisible');
		selector('.modal-rate').lastElementChild.classList.add('invisible');
	}
}

function memoryGame(evt) {
    cardReveal(evt);
    moveCount();
	userRating = ratingGame(move);
	gameCompletion();
}

function closeModal(evt) {
	if (evt.target === modal || evt.target === modalClose || evt.target === resetBTNmodal) {
		modal.classList.remove('visible');
	}
}

function leaderboardView(evt){
	const arrow = leaderboardTitle.firstElementChild;
	if(evt.target === leaderboardTitle || evt.target === leaderboardTitle.firstElementChild) {
		selector('.leaderboard').classList.toggle('visible');
		arrow.classList.toggle('move');
	}
}

function timeAdd() {
	// sec is increased by 1 every 1000ms.
	sec++;
	// if sec reach 60, sec is reset to 0 and mins is increased by 1. 
	if (sec >= 60) {
		sec = 0;
		mins++;
		if (mins >= 60) {
			mins = 0;
		}
	}
	selector('.timer').textContent = 'Total Time ' + (mins? (mins>9 ? mins : '0' + mins) : '00') + ' : ' + (sec? (sec>9 ? sec : '0' + sec) : '00');
	// to make setTimeout executed every 1000ms repeatedly
	countingTime();
}

function countingTime() {
	//variable is created to use for clearTimeout
	t = setTimeout(timeAdd, 1000);
}

function noGameResult() {
	const leaderboardNoRecord = newEl('p'),
		  leaderboardArea = selector('.leaderboard');
	if(leaderboardArea.lastElementChild.nodeName !== 'P') {	  
		leaderboardNoRecord.textContent = 'There is no game record yet. Shall we start a game now?';
		leaderboardArea.appendChild(leaderboardNoRecord);
		leaderboardArea.classList.toggle('norecord');
	}
}

// in order to get all the game results which are stored in Local Storage
function allGameRecords() {
	const leaderboardArea = selector('.leaderboard');

	let totalRecord = localStorage.length,
		gameResult,
		noRCD = leaderboardArea.lastElementChild;

	if(leaderboardArea.lastElementChild.nodeName === 'P'){
		leaderboardArea.removeChild(noRCD);
	}

	for(let i=0;i<=totalRecord;i++){
		// JSON.parse() the data will be JS object which is a composite of strings
		gameResult = JSON.parse(window.localStorage.getItem(`game${i}`));
		rankingArr.push(gameResult);
	}
	// null?
	rankingArr.pop();
}

/* ---------------------------------------------------------------------------------------------
	in order to get top three records, the less movementIn order to get the top three records,
	the fewer movements take precedence. If there are few tied scores in the movement,
	the shorter time will take precedence.
--------------------------------------------------------------------------------------------- */
function topThreeRecords(arr) {
	arr.map(function(item){
		let newTotalMove, newTotalTime;
		newTotalMove = parseInt(item[1].replace(/\D/g,''));
		newTotalTime = parseInt(item[0].replace(/\D/g,''));
		item.splice(-3, 1, newTotalMove);
		item.splice(-2, 1, newTotalTime);
	});
	//It is possible to create an array in the order of number with sort method.
	newArrRank = arr.sort(function(a,b){
		return a[0] - b[0];
	});
	// in order to get only the top three results
	topThree = newArrRank.slice(0,3);
}

// leaderboard functionalities
function gameResults() {
	allGameRecords();
	topThreeRecords(rankingArr);
	rankingArea();
	
	topThree.map(function(item, idx){
		let topRanking = document.querySelectorAll('.ranking');
		topRanking[idx].firstElementChild.textContent = item[2];
		topRanking[idx].firstElementChild.nextElementSibling.textContent = `Total ${item[0]} Moves`;

		let num = item[1].toString(),
			rankingMins, rankingSecs1, rankingSecs2;

		if(num.length > 2){
			let tempTime = num.split('');
			rankingMins = tempTime[0];
			rankingSecs1 = tempTime[1];
			rankingSecs2 = tempTime[2];
			topRanking[idx].firstElementChild.nextElementSibling.nextElementSibling.textContent = `Total ${rankingMins} mins ${rankingSecs1}${rankingSecs2} seconds`;
		} else {
			item[1] = parseInt(num);
			topRanking[idx].firstElementChild.nextElementSibling.nextElementSibling.textContent = `Total ${item[1]} seconds`;
		}
	});
}

function gameRankingView() {
	localStorage.length === 0 ? noGameResult() : gameResults();
}

// to create a leaderboard
function rankingArea() {
	const fragment = document.createDocumentFragment();
	let rankingNum = document.querySelectorAll('.ranking').length;

	// without this if statement, the leaderboard keeps appending 'li' and inner elements after game is reset
	if(rankingNum < topThree.length){
		for(let i=rankingNum;i<topThree.length;i++) {

			let leaderboardLi = document.createElement('li');
			leaderboardLi.setAttribute('class','ranking');
			leaderboardLi.classList.add(`number${i+1}`);

			for(let j=0;j<topThree[0].length;j++) {
				let leaderboardSpan = document.createElement('span');
				if(j === 1){
					leaderboardSpan.setAttribute('class','ranking-move');
				} else if(j === 0){
					leaderboardSpan.setAttribute('class','ranking-time');
				} else if(j === 2){
					leaderboardSpan.setAttribute('class','ranking-name');
				}
				leaderboardLi.insertAdjacentElement('afterbegin',leaderboardSpan);
			}
			fragment.appendChild(leaderboardLi);
		}
		selector('.leaderboard-container').appendChild(fragment);
	}
}

function resetGame(evt) {
	let changedNameCon = selector('.modal-container').firstElementChild;

	if(newCardDeck){
		const deckUl = selector('.deck');
		selector('.wrapper').removeChild(deckUl);
	}

	//Time resetting
	clearTimeout(t);

	rankingArr = [],
	compareArr = [],
	leaderBoard = [],
	pairFound = 0,
	move = 0,
	sec = 0,
	mins = 0;

	selector('.move').textContent = 'Total ' + move + ' move';
	selector('.timer').textContent = `00 : 00`;
	selector('.rate').firstElementChild.textContent = 'Great Job!';
	selector('.rate').lastElementChild.previousElementSibling.classList.remove('invisible');
	selector('.rate').lastElementChild.classList.remove('invisible');
	selector('.alert').textContent = 'Here We Go!';

	cardMaker(cardDeck);
	deckOfCards = document.body.querySelectorAll('.card');
	duplicate(deckOfCards);
	cardList = [...document.body.querySelectorAll('.card')];
	newCardDeck = cardShuffle(cardList);

	replaceCard(newCardDeck, selector('.deck'));
	for (let card of newCardDeck) {
		card.classList.add('flipped', 'show');
	}

	flippingCards = setTimeout(unshowingCard, 4000);
	countingTime();
	if(changedNameCon !== "INPUT") {
		selector('.modal-container').replaceChild(userNameInput, changedNameCon);
	}

	gameRankingView();

	const gameArea = document.getElementById('game');
	gameArea.scrollIntoView();
}

document.body.onload = resetGame;
resetBTNmain.addEventListener('click', resetGame);
resetBTNmodal.addEventListener('click', resetGame);
modal.addEventListener('click', closeModal);

// to save a player's name in local storage
userNameInput.addEventListener('keydown', function(evt) {
	name = userNameInput.value;
	const userNameCon = newEl('p');
	userNameCon.setAttribute('class', 'user-name');

	let key = localStorage.length;

	if(evt.key === 'Enter'){
		leaderBoard.push(name);
		userNameCon.textContent = name;
		selector('.modal-container').replaceChild(userNameCon, userNameInput);
		//console.log(leaderBoard);
		localStorage.setItem(`game${key}`, JSON.stringify(leaderBoard));
	}
});

leaderboardTitle.addEventListener('click', leaderboardView);

const t1 = performance.now();

console.log(`it took ${t1-t0} milliseconds to load this page.`);
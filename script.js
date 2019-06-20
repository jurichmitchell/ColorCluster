//Mitchell Jurich
//Client Side Web Development - Final Project
//Last Edit: 11/29/17

//Game constants
const COLORS = new Array("seashell", "slategray", "mediumseagreen", "orchid", "coral", "crimson");
const MAX_SIZE = 20;
const MIN_SIZE = 4;
const NUM_SIZES = (MAX_SIZE - MIN_SIZE + 1);
const LINE_WIDTH = 2;
const MENU_HTML = 	"<div id = 'logoDiv'><img id = 'logo'></div>" +
						"<div id = 'gameInfoDiv' class = 'gameInfoDiv'></div>" +
						"<div class = 'sliderDiv'><input id = 'sizeSlider' class = 'sizeSlider' type = 'range' value = '4'/></div>" +
						"<div id = 'playBttnDiv'><input id = 'playBttn' type = 'button' value = 'Play Game'/></div>";
const GAME_HTML = 	"<canvas id = 'canvas' width = '800vw' height = '560vh'></canvas>" +
					"<div id = 'colorButtonsDiv'>" +
						"<table id = 'colorButtonsTable'>" +
							"<tr>" +
								"<td><input type = 'button' id = 'seashellBttn'/></td>" +
								"<td><input type = 'button' id = 'slategrayBttn'/></td>" +
								"<td><input type = 'button' id = 'mediumseagreenBttn'/></td>" +
							"</tr>" +
							"<tr>" +
								"<td><input type = 'button' id = 'orchidBttn'/></td>" +
								"<td><input type = 'button' id = 'coralBttn'/></td>" +
								"<td><input type = 'button' id = 'crimsonBttn'/></td>" +
							"</tr>" +
						"</table>" +
					"</div>";
const MODAL_CLOSE_BTTN = "<span id = 'modalClose'>&times;</span>";
const NAV_NEWGAME_MODAL_FOOTER = "<input id = 'modalNavNewGameBttn' class = 'modalBttn modalCenterBttn' type = 'button' value = 'Play New Game'>";
const ENDGAME_MODAL_FOOTER = "<input id = 'modalNewGameBttn' class = 'modalBttn modalLeftBttn' type = 'button' value = 'New Game'>" +
								"<input id = 'modalMenuBttn' class = 'modalBttn modalRightBttn' type = 'button' value = 'Menu'>";

//Game releated variables
var size; //The width and height of the matrix
var matrix; //The matrix holding all squares
var currColor; //The current color of the player's squares
var numMoves; //How many moves the player has made
var parMoves; //The par number of moves for this size matrix

//Local sorage (statistics) related variables
var canStoreLocally;
var numLossesBySize = new Array();
var numWinsBySize = new Array();

//Document header elements
var nav;
var movesCell;
var parCell;
var navNewGame;
var navStatistics;

//Document organization elements
var contentDiv;

//Document canvas elements
var canvas;
var context;

//Document menu elements
var logo;
var logoImg = new Image();
var sizeSlider;
var gameInfoDiv;
var playBttn;

//Document input elements
var seashellBttn;
var slategrayBttn;
var mediumseagreenBttn;
var orchidBttn;
var coralBttn;
var crimsonBttn;

//Document modal elements
var modal;
var modalContent;
var modalHeader;
var modalBody;
var modalNewGameBttn;
var modalMenuBttn;

window.addEventListener("load", start, false);

//Setup event listeners for header elements and get references to needed elements
function start() {
	logoImg.src = "logo4.png";
	
	nav = document.getElementById("hamburgerMenu");
	//When nav is clicked, hamburger menu will be acivated/deactivated
	nav.addEventListener("click", function() {
										if (nav.className === "inactive")
											nav.className = "active"
										else
											nav.className = "inactive" }, false);
	
	movesCell = document.getElementById("movesCell");
	parCell = document.getElementById("parCell");
	
	contentDiv = document.getElementById("content");
	
	modal = document.getElementById("modal");
	modalHeader = document.getElementById("modalHeader");
	modalBody = document.getElementById("modalBody");
	modalFooter = document.getElementById("modalFooter");
	
	navNewGame = document.getElementById("navNewGame");
	navNewGame.addEventListener("click", function() {
									var newSize = size;
									//If the player is in game, a newgame will count as a loss
									if (localStorage.getItem("resumeGame") == "true")
										displayModal("New Game" + MODAL_CLOSE_BTTN,
											"<div id = 'modalText'>The current game will count as a loss</div>" +
											"<div id = 'modalGameInfoDiv' class = 'gameInfoDiv'></div>" +
											"<div class = 'sliderDiv'><input id = 'modalSizeSlider' class = 'sizeSlider' type = 'range' value = '" + size + "'/></div>",
											NAV_NEWGAME_MODAL_FOOTER);
									else
										displayModal("New Game" + MODAL_CLOSE_BTTN,
											"<div id = 'modalText'>Select desired size</div>" +
											"<div id = 'modalGameInfoDiv' class = 'gameInfoDiv'></div>" +
											"<div class = 'sliderDiv'><input id = 'modalSizeSlider' class = 'sizeSlider' type = 'range' value = '" + size + "'/></div>",
											NAV_NEWGAME_MODAL_FOOTER);
									//Setup close button
									document.getElementById("modalClose").addEventListener("click",
										function() { modal.style.display = "none"; }, false);
									//Setup modalSizeSlider
									var modalSizeSlider = document.getElementById("modalSizeSlider");
									modalSizeSlider.min = MIN_SIZE;
									modalSizeSlider.max = MAX_SIZE;
									modalGameInfoDiv.innerHTML = "<div id = 'sizeInfo'>Size: " + size +
										"</div><div id = 'parInfo'>Par: "+ (size * 2) + "</div>";
									modalSizeSlider.addEventListener("input", function() {
										newSize = parseInt(modalSizeSlider.value);
										modalGameInfoDiv.innerHTML = "<div id = 'sizeInfo'>Size: " +
											newSize + "</div><div id = 'parInfo'>Par: " + (newSize * 2) +
											"</div>" }, false);
									//Setup new game button
									document.getElementById("modalNavNewGameBttn").addEventListener("click",
										function() {
											//Count current game as loss
											numLossesBySize[size - MIN_SIZE]++;
											localStorage.setItem("numLossesBySize", numLossesBySize.join(","));
											//Remove matrix data stored locally
											for (var i = 0; i < size; i++)
												localStorage.removeItem("matrixRow" + i);
											size = parseInt(newSize);
											localStorage.setItem("resumeGame", "false");
											startGame();
											modal.style.display = "none";
										}, false);
									}, false);
	
	navStatistics = document.getElementById("navStatistics");
	navStatistics.addEventListener("click", function() {
									displayModal("Statistics" + MODAL_CLOSE_BTTN, generateStatistics(), "");
									document.getElementById("modalClose").addEventListener("click",
										function() { modal.style.display = "none"; }, false);
									}, false);
	
	//Load in user local storage data if possible
	if (canStoreLocally()) {
		//Check if we need to set up inital storage data
		if (localStorage.getItem("numLossesBySize") == null) {
			setupInitialData();
		}
		loadData();
	}
	//If can't store data to machine, load main menu
	else
		mainMenu();
}

//Postcondtion: document contentDiv contains main menu elements
function mainMenu() {
	contentDiv.innerHTML = MENU_HTML;
	
	logo = document.getElementById("logo");
	logo.src = logoImg.src;
	
	movesCell.innerHTML = "";
	parCell.innerHTML = "";
	
	sizeSlider = document.getElementById("sizeSlider");
	sizeSlider.min = MIN_SIZE;
	sizeSlider.max = MAX_SIZE;
	
	gameInfoDiv = document.getElementById("gameInfoDiv");
	playBttn = document.getElementById("playBttn");
	playBttn.addEventListener("click", startGame, false);
	
	size = parseInt(sizeSlider.value);
	gameInfoDiv.innerHTML = "<div id = 'sizeInfo'>Size: " + size +
		"</div><div id = 'parInfo'>Par: "+ (size * 2) + "</div>";
	sizeSlider.addEventListener("input", function() {
											size = parseInt(sizeSlider.value);
											gameInfoDiv.innerHTML = "<div id = 'sizeInfo'>Size: " +
												size + "</div><div id = 'parInfo'>Par: " + (size * 2) +
												"</div>" }, false);
}

//Postcondition: document contentDiv contains game elements
function startGame() {
	contentDiv.innerHTML = GAME_HTML;
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	seashellBttn = document.getElementById("seashellBttn");
	seashellBttn.addEventListener("click", function(){
												//do nothing if this color is already selected
												if (currColor === COLORS[0]) {return;}
												//call floodFill on top-left square
												floodFill(0, 0, COLORS[0]);
												updateGamestate(COLORS[0]);
												}, false);
	slategrayBttn = document.getElementById("slategrayBttn");
	slategrayBttn.addEventListener("click", function(){
												if (currColor === COLORS[1]) {return;}
												floodFill(0, 0, COLORS[1]);
												updateGamestate(COLORS[1]);
												}, false);
	mediumseagreenBttn = document.getElementById("mediumseagreenBttn");
	mediumseagreenBttn.addEventListener("click", function(){
												if (currColor === COLORS[2]) {return;}
												floodFill(0, 0, COLORS[2]);
												updateGamestate(COLORS[2]);
												}, false);
	orchidBttn = document.getElementById("orchidBttn");
	orchidBttn.addEventListener("click", function(){
												if (currColor === COLORS[3]) {return;}
												floodFill(0, 0, COLORS[3]);
												updateGamestate(COLORS[3]);
												}, false);
	coralBttn = document.getElementById("coralBttn");
	coralBttn.addEventListener("click", function(){
												if (currColor === COLORS[4]) {return;}
												floodFill(0, 0, COLORS[4]);
												updateGamestate(COLORS[4]);
												}, false);
	crimsonBttn = document.getElementById("crimsonBttn");
	crimsonBttn.addEventListener("click", function(){
												if (currColor === COLORS[5]) {return;}
												floodFill(0, 0, COLORS[5]);
												updateGamestate(COLORS[5]);
												}, false);
	
	//if we are resuming a previously quit game
	if (localStorage.getItem("resumeGame") == "true") {
		loadGamestate();
	}
	else {
		numMoves = 0;
		parMoves = size * 2;
		randomizeMatrix(size);
	}
	
	movesCell.innerHTML = "Moves: " + numMoves;
	parCell.innerHTML = "Par: " + parMoves;
	
	if (canStoreLocally())
		saveGamestate();
	
	drawMatrix();
}

//Precondition: 'size' is a positive integer
//Postcondition: 'matrix' will be a 2D array of length and width 'size'
//               filled with random colors from 'COLORS'
function randomizeMatrix(size) {
	matrix = new Array(size);
	for (var i = 0; i < size; i++)
		matrix[i] = new Array(size);
		
	//Fill each index with a random color by generating an int from 0 to 5
	//and accessing it's appropriate index of the COLORS array
	for (var row = 0; row < matrix.length; row++)
		for (var col = 0; col < matrix[row].length; col++)
			matrix[row][col] = COLORS[Math.floor(Math.random() * 6)];
	
	//Set the player's current color to the top-left of the matrix
	currColor = matrix[0][0];
}

//Precondition: 'matrix' is a 2D array filled with colors from 'COLORS'
//Postconditon: The contents of 'matrix' will be drawn to 'canvas'
function drawMatrix() {
	//Calculate the width of each rectangle based on the number
	//in each row and the width of the canvas
	//Use Math.floor() to avoid visible "seams" between rectangles
	var rectWidth = Math.floor(canvas.width / matrix[0].length);
	//Calculate the height of each rectangle based on the number
	//in each column and the height of the canvas
	var rectHeight = Math.floor(canvas.height / matrix.length);
	//If the total width of all rectangles doesn't reach the full
	//width of the canvas due to the Math.floor, determine how much
	//of an offset should be added to keep the gameboard centered
	var horizontalOffset = Math.floor((canvas.width - rectWidth * size) / 2);
	
	for (var row = 0; row < matrix.length; row++) {
		for (var col = 0; col < matrix[row].length; col++) {
			//Set the rectangle's color
			context.fillStyle = matrix[row][col];
			//Draw the current rectangle
			context.fillRect(col * rectWidth + horizontalOffset, row * rectHeight, rectWidth, rectHeight);
		}
	}
	
	drawControlLine(rectWidth, rectHeight, horizontalOffset);
}

//Precondition: The matrix has already been drawn to the canvas
//Postcondition: Draws a line to the canvas surounding all the squares the
//				 player currently controls
function drawControlLine(rectWidth, rectHeight, horizontalOffset) {
	context.beginPath();
	//used to keep track of which indicies have been checked by floodOutline
	var matrixCheck = new Array(size);
	for (var i = 0; i < size; i++)
		matrixCheck[i] = new Array(size);
	//Call flood outline to generate a path surrounding the player controlled squares
	floodOutline(0, 0, rectWidth, rectHeight, horizontalOffset, matrixCheck);
	//set up path properties
	context.lineWidth = LINE_WIDTH;
	context.lineCap = "square";
	context.strokeStyle = "black";
	//draw path
	context.stroke();
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

//Outlines the borders of the given square if it's the player's 'currColor' and the neighboring squares aren't
function floodOutline(row, col, rectWidth, rectHeight, horizontalOffset, matrixCheck) {
	//if row and col are valid indicies of 'matrix'
	if (row >= 0 && row < matrix.length
			&& col >= 0 && col < matrix[0].length) {
		//if this square hasn't been checked yet
		if (matrixCheck[row][col] !== "checked") {
			//if this square is the same color as the player's 'currColor'
			if (matrix[row][col] === currColor) {
				//Set currPoint to this square's top-left
				var currPoint = new Point(horizontalOffset + (col * rectWidth), (row * rectHeight));
				context.moveTo(currPoint.x, currPoint.y);
				
				//Check the surrounding four squares
				//Set currPoint to top-right
				currPoint.x = currPoint.x + rectWidth;
				//If square above is not a valid index or not the player's 'currColor'
				if (row - 1 < 0 || row - 1 >= matrix.length || matrix[row - 1][col] !== currColor)
					//Draw a line from top-left to top-right
					context.lineTo(currPoint.x, currPoint.y);
				//else pick up the pen and move to top-right
				else
					context.moveTo(currPoint.x, currPoint.y);
				
				//Set currPoint to bottom-right
				currPoint.y = currPoint.y + rectHeight;
				//If the square to the right is not a valid index or not the player's 'currColor'
				if (col + 1 < 0 || col + 1 >= matrix[0].length || matrix[row][col + 1] !== currColor)
					//Draw a line from top-right to bottom-right
					context.lineTo(currPoint.x, currPoint.y);
				//else pick up the pen and move to bottom-right
				else
					context.moveTo(currPoint.x, currPoint.y);
				
				//Set currPoint to bottom-left
				currPoint.x = currPoint.x - rectWidth;
				//If the square to the bottom is not valid or not 'currColor'
				if (row + 1 < 0 || row + 1 >= matrix.length || matrix[row + 1][col] !== currColor)
					//Draw line from bottom-right to bottom-left
					context.lineTo(currPoint.x, currPoint.y);
				//else move pen to bottom-left
				else
					context.moveTo(currPoint.x, currPoint.y);
				
				//Set currPoint to top-left
				currPoint.y = currPoint.y - rectHeight;
				//If the square to the left is not valid or not 'currColor'
				if (col - 1 < 0 || col - 1 >= matrix[0].length || matrix[row][col - 1] !== currColor)
					//Draw line from bottom-left to top-left
					context.lineTo(currPoint.x, currPoint.y);
				
				//Set this square to checked
				matrixCheck[row][col] = "checked";
				//call floodOutline on the 4 surrounding squares
				floodOutline(row + 1, col, rectWidth, rectHeight, horizontalOffset, matrixCheck);
				floodOutline(row - 1, col, rectWidth, rectHeight, horizontalOffset, matrixCheck);
				floodOutline(row, col + 1, rectWidth, rectHeight, horizontalOffset, matrixCheck);
				floodOutline(row, col - 1, rectWidth, rectHeight, horizontalOffset, matrixCheck);
			}
		}
	}
}

//Precondition: 'currColor' is not === 'newColor'
//Poscondition: All indicies of matrix of 'currColor' will be changed
//				to 'newColor'
function floodFill(row, col, newColor) {
	//if row and col are valid indicies of 'matrix'
	if (row >= 0 && row < matrix.length
			&& col >= 0 && col < matrix[0].length) {
		//if this square is the same color as the player's 'currColor'
		if (matrix[row][col] === currColor) {
			//update this square to the player's 'newColor'
			matrix[row][col] = newColor;	
			//call floodFill on the 4 surrounding squares
			floodFill(row + 1, col, newColor);
			floodFill(row - 1, col, newColor);
			floodFill(row, col + 1, newColor);
			floodFill(row, col - 1, newColor);
		}
	}
}

//Precondtion: The drawMatrix() function has been previously called at least once
//Postcondition: The player's 'currColor' will be updated to their 'newColor',
//               the canvas will be updated to reflect the current state of 'matrix',
//               the game end condition will be checked
function updateGamestate(newColor) {
	numMoves++;
	movesCell.innerHTML = "Moves: " + numMoves;
	currColor = newColor;
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawMatrix();
	
	//Check if all squares are the same color (end condition)
	var allSame = true;
	for (var row = 0; row < matrix.length; row++)
		for (var col = 0; col < matrix[row].length; col++)
			if (matrix[row][col] != currColor)
				allSame = false;
			
	//Check if end condition is met
	if (allSame) {
		if (numMoves <= parMoves) {
			numWinsBySize[size - MIN_SIZE]++; //update session variable
			localStorage.setItem("numWinsBySize", numWinsBySize.join(",")); //update localstorage variable
			displayModal("You Win!", generateStatistics(), ENDGAME_MODAL_FOOTER);
		}
		else {
			numLossesBySize[size - MIN_SIZE]++;
			localStorage.setItem("numLossesBySize", numLossesBySize.join(","));
			displayModal("You Lose!", generateStatistics(), ENDGAME_MODAL_FOOTER);
		}
		//Setup endgame modal buttons
		modalNewGameBttn = document.getElementById("modalNewGameBttn");
		modalNewGameBttn.addEventListener("click", function() {
										modal.style.display = "none";
										startGame() }, false);
	
		modalMenuBttn = document.getElementById("modalMenuBttn");
		modalMenuBttn.addEventListener("click", function() {
										modal.style.display = "none";
										mainMenu() }, false);
		
		localStorage.setItem("resumeGame", false); //so we won't resume the completed game on next load
		//remove all the game data stored locally
		for (var i = 0; i < size; i++)
			localStorage.removeItem("matrixRow" + i);
		localStorage.removeItem("size");
		localStorage.removeItem("numMoves");
	}
	else if (canStoreLocally()){
		saveGamestate();
	}
}

//Displays the modal with given header, body, and footer HTML
function displayModal(headerHTML, bodyHTML, footerHTML) {
	modalHeader.innerHTML = headerHTML;
	modalBody.innerHTML = bodyHTML;
	modalFooter.innerHTML = footerHTML;
	modal.style.display = "block";
}

//Returns a string containing HTML for a table of the user's wins and losses saved to localStorage
function generateStatistics() {
	//If the document element's width is > 600px the table can be created in one piece
	if (document.documentElement.getBoundingClientRect().width > 600) {
		var stats = "<table id = 'statsTable'><tr><td></td><td colspan = '" + NUM_SIZES + "'>Size</td></tr><tr><td></td>";
		for (var i = 0; i <= MAX_SIZE - MIN_SIZE; i++) {
			stats = stats.concat("<td>" + (i + MIN_SIZE) + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Wins</td>");
		for (var i = 0; i <= MAX_SIZE - MIN_SIZE; i++) {
			stats = stats.concat("<td>" + numWinsBySize[i] + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Losses</td>");
		for (var i = 0; i <= MAX_SIZE - MIN_SIZE; i++) {
			stats = stats.concat("<td>" + numLossesBySize[i] + "</td>");
		}
		stats = stats.concat("</tr></table>");
		return stats;
	}
	//else the table needs to be created in two pieces, top and bottom
	else {
		var halfSizes = Math.ceil(NUM_SIZES / 2);
		//top half
		var stats = "<table id = 'statsTable'><tr><td></td><td colspan = '" + halfSizes +
			"'>Size</td></tr><tr><td></td>";
		for (var i = 0; i < halfSizes; i++) {
			stats = stats.concat("<td>" + (i + MIN_SIZE) + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Wins</td>");
		for (var i = 0; i < halfSizes; i++) {
			stats = stats.concat("<td>" + numWinsBySize[i] + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Losses</td>");
		for (var i = 0; i < halfSizes; i++) {
			stats = stats.concat("<td>" + numLossesBySize[i] + "</td>");
		}
		//bottom half
		stats = stats.concat("</tr><tr><td></td><td colspan = '" + (NUM_SIZES - halfSizes) +
			"'>Size</td></tr><tr><td></td>");
		for (var i = halfSizes; i < NUM_SIZES; i++) {
			stats = stats.concat("<td>" + (i + MIN_SIZE) + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Wins</td>");
		for (var i = halfSizes; i < NUM_SIZES; i++) {
			stats = stats.concat("<td>" + numWinsBySize[i] + "</td>");
		}
		stats = stats.concat("</tr><tr><td>Losses</td>");
		for (var i = halfSizes; i < NUM_SIZES; i++) {
			stats = stats.concat("<td>" + numLossesBySize[i] + "</td>");
		}
		stats = stats.concat("</tr></table>");
		return stats;
	}
}

//Returns true if we can store to the user's machine
function canStoreLocally() {
	if (typeof(Storage) === "undefined")
		return false;
	return true;
}

//Precondition: We can store to user's machine and player data isn't present
//Postcondition: Initial player data exists in localStorage
function setupInitialData() {
	//generate a string of default 0 values for wins and losses
	var defaultValues = "";
	for (var i = 0; i <= MAX_SIZE - MIN_SIZE; i++) {
		//Add a "0" for this size
		defaultValues = defaultValues.concat("0");
		//If there are more items to add, add a delimiter ","
		if (i + 1 <= MAX_SIZE - MIN_SIZE)
			defaultValues = defaultValues.concat(",");
	}
	localStorage.setItem("numLossesBySize", defaultValues);
	localStorage.setItem("numWinsBySize", defaultValues);
	localStorage.setItem("resumeGame", "false");
}

//Precondition: A game is currently in progress
//Postcondition: The game's information will be saved to localStorage
function saveGamestate() {
	localStorage.setItem("resumeGame", "true");
	localStorage.setItem("size", size);
	for (var row = 0; row < size; row++)
		localStorage.setItem("matrixRow" + row, matrix[row].join(","));
	localStorage.setItem("numMoves", numMoves);
}

//Precondition: A game was in progress on last exit
//Postcondition: The previous game's information will be loaded from localStorage
function loadGamestate() {
	size = parseInt(localStorage.getItem("size"));
	matrix = new Array(size);
	for (var row = 0; row < matrix.length; row++)
		matrix[row] = localStorage.getItem("matrixRow" + row).split(",");
	currColor = matrix[0][0];
	numMoves = parseInt(localStorage.getItem("numMoves"));
	parMoves = size * 2;
}

//Precondition: We can store to user's machine and player data is present
//Postcondition: Player data is loaded from localStorage and previoous game is resumed
//				 or main menu is loaded
function loadData() {
	//Split the strings and store them in arrays
	numLossesBySize = localStorage.getItem("numLossesBySize").split(",");
	numWinsBySize = localStorage.getItem("numWinsBySize").split(",");
	
	//if the player quit in the middle of the game last time, resume that game
	if (localStorage.getItem("resumeGame") == "true") {
		startGame();
	}
	//else load the main menu
	else
		mainMenu();
}
window.onload = function (){//listeners to add when window is loaded
	document.getElementById("newGame").addEventListener("click", newGame);
	document.querySelector("#stats>#soundEffect").addEventListener("click",toggleSoundFX);
}

// Initialize Firebase
var config = {
	apiKey: "AIzaSyA5AAx9IPuv45ggD97s00i-6x9V258RALk",
	authDomain: "snake-1c247.firebaseapp.com",
	databaseURL: "https://snake-1c247.firebaseio.com",
	projectId: "snake-1c247",
	storageBucket: "",
	messagingSenderId: "845093712499"
};
firebase.initializeApp(config);
var dB = firebase.database();

//onvalue change for whenever new scores are added to the scores array on firebase
var scoreArray = [];
dB.ref("/scores").on("value",function(snapshot){
	if (snapshot.val()!=null){
		scoreArray = snapshot.val();
	}
});

const canvas = document.getElementById("gameBoard");
const context = canvas.getContext("2d");
//create gradient to fill board with
var gradient = context.createLinearGradient(0,0,canvas.width,canvas.height);
gradient.addColorStop("0","#02260F");//starting point denoted by 0
gradient.addColorStop("1","#331D0C");//ending point denoted by 1
//set fill style with Gradient
context.fillStyle = gradient;
//fill board with fill style
context.fillRect(0,0,canvas.width,canvas.height);

var scale_x = 14, scale_y=14;
context.scale(scale_x,scale_y);//scales up the unit size for the snake from being a board that is 600 by 600 with single unit boxes to being a little under 43 by 43 with single unit boxes
//makes drawing the snake so much easier

var snake = new Snake();

var newGameStarted=false;//want this to be false when game is loaded so that no errors are returned from not having a snake object

function gameOver(){//function that runs when game is lost - when the player hits the snake or the wall
	newGameStarted = false;//freezes game
	document.querySelector("#overlay").style.display="block";//shows overlay with score and new game button
	var highScore = Math.max(...scoreArray);//using spread operator calculate max score in scoreArray
	var yourScore = snake.score;//gets lost game's score
	if(highScore==yourScore){//determines what is set as text in overlay for score result
		var scoreComp = "You tied the high score!";
	} else if (highScore<yourScore) {//when the player gets the new high score
		var scoreComp = "You got the new high score! Your score was " + yourScore + " berries."
	} else{//when the player doesn't tie or get the new high score
		var scoreComp = "High score: " + highScore + ". Your score: " + yourScore;
	}
	document.querySelector("#information").innerHTML = scoreComp;//through setting innerHTML to overlayHTML, I am able to reset the information presentation each game
	document.querySelector("#bonus").style.display="none";//hide the bonus outlay
	scoreArray.push(snake.score);//push the user's score to the scoreArray
	dB.ref("/scores").set(scoreArray);//set the array in the real time database to be the current score
	snake.currSong.pause();//pause the current song
	snake.currSong = "";//make it so the user cannot play the current song any more for this game
	document.querySelector("body").style.backgroundImage="";//reset background to be plain color
}

function newGame(){//function that runs every time the new game button is pushed
	document.querySelector("#overlay").style.display="none";
	food = new Food({x:30,y:30});//overwrites current or creates first instance of food object
	snake = new Snake();//overwrites current or creates first instance of snake object
	updateStats();//resets the score for the new game
	newGameStarted = true;//resets variables pertinent to drawSnake function which draws canvas
	moveInterval = 300;
	drawSnake();//draw canvas function
}

let moveCounter = 0;
let moveInterval = 300;//this is a time controller for drawing the snake only every so many milliseconds
//300 is how many milliseconds between subsequent redraws of the canvas
//when game starts new, the redraws only happen after at least 300 milliseconds
//as snake eats 10 more berries, moveInterval is decremented to make the snake move faster
//so moveInterval can be thought of as speed as well, because each redraw, moves the snake 1 unit
//at the beginning, the snake only moves 1000/300 = 3 1/3 times so it only moves 3 1/3 units per second
//but as moveInterval is decremented by 20 every ten berries, after 50 the snake is moving at 1000 / 200 = 5 units per second

let lastTime = 0;

//animate snake on canvas - function is called back recursively after every redraw of the canvas to snake.update and snake.draw specifications
function drawSnake(time=0){

	if(newGameStarted && !snake.freeze_game){
		const deltaTime = time - lastTime;//delta time is the time between recursive calls of the function
		lastTime = time;
		moveCounter += deltaTime;//moveCounter is incremented by deltaTime until greater than moveInterval. then in snake.update, moveCounter is set back to 0
		//this allows us to control, with the if statement below, how quickly the snake is redrawn

		if(moveCounter > moveInterval){//I want a certain amount of time to have passed prior to the redraw of the snake

			snake.update();//update snake cells
			snake.draw();//redraw canvas and snake

		}

		requestAnimationFrame(drawSnake);//after redraw of canvas, callback recursive function
	} else {
		requestAnimationFrame(drawSnake);//after redraw of canvas, callback recursive function
	}
}

document.addEventListener("keydown",function(event){
	if(event.keyCode == 37 && snake.pos[1].x!=(snake.pos[0].x-1)){//when the left arrow key is pressed, and the second snake unit is not positioned directly to the left of the current head position
		snake.changeDir({x:-1,y:0});
	} else if(event.keyCode == 38 && snake.pos[1].y!=(snake.pos[0].y-1)){//when the up arrow key is pressed, and the second snake unit is not positioned directly above of the current head position
		snake.changeDir({x:0,y:-1});
	} else if(event.keyCode == 39 && snake.pos[1].x!=(snake.pos[0].x+1)){//when the right arrow key is pressed, and the second snake unit is not positioned directly to the right of the current head position
		snake.changeDir({x:1,y:0});
	} else if(event.keyCode == 40 && snake.pos[1].y!=(snake.pos[0].y+1)){//when the down arrow key is pressed, and the second snake unit is not positioned directly below of the current head position
		snake.changeDir({x:0,y:1});
	} else if (event.keyCode == 66 && snake.level >= snake.bonusLevel){//when the b button is pressed and the player has reached the bonus phase
		snake.backgroundChanger();
	} else if(event.keyCode == 67 && snake.level >= snake.bonusLevel){//when the c button is pressed and the player has reached the bonus phase
		snake.collision = !snake.collision;
	} else if (event.keyCode == 70 && snake.level >= snake.bonusLevel){//when the f button is pressed and the player has reached the bonus phase
		snake.freeze_game = !snake.freeze_game;
	} else if (event.keyCode == 77 ){//when the m button is pressed and the player has reached the bonus phase
		toggleSoundFX();	
	} else if (event.keyCode == 80 && snake.level >= snake.bonusLevel){//when the p button is pressed and the player has reached the bonus phase
		snake.playSong();
	}
	//LOGIC: in addition to key press, the direction that the snake is currently moving in is just as important
	//however, it is not good enough to understand that the snake has had command "left","right","down","up" sent to it
	//a player could push two directions before next movement is set to occur
	//if this happens, the user has sent signal to move in one direction and then another
	//for instance, let's say snake is moving to right.
	//if user presses down button and then left before next movement, I don't want the snake to move left because the last directive was down
	//I have to check location of head against the location of the second body unit
	//this will always give us the actual direction the snake is moving in
	//additionally, there are some of these key presses that should do nothing until bonus phase has been hit, thus the && snake.level >= snake.bonusLevel
})

//collision test - make sure that the next location for the head is not already occupied by the snake body
//if the tail is located there, it doesn't matter because in most cases, the tail will be removed before the head moves to that spot
function objInSnake(locObj){

	if(snake.berryEaten == true){
		for (var i = 1 ; i < snake.pos.length - 2 ; i++){
			if(snake.pos[i].x == locObj.x && snake.pos[i].y == locObj.y){
				return true;
			}
		}
	} else {
		for (var i = 1 ; i < snake.pos.length - 1 ; i++){
			if(snake.pos[i].x == locObj.x && snake.pos[i].y == locObj.y){
				return true;
			}
		}		
	}
	return false;
}

//updates the score and the level for the snake - called every time a berry is eaten
function updateStats(){
	document.querySelector("#score").innerText = "Score: " + snake.score;
	document.querySelector("#level").innerText = "Level: " + snake.level;
}

var toggleSoundFX = function(){//function that allows user to turn bite and hitting wall sound effects off
	//also changes the sound effect icon in the stats div from volume icon to volume off icon
	snake.soundEffects = !snake.soundEffects;
	var soundClass = document.querySelector("#soundEffect").className;
	if(soundClass.indexOf("up")>-1){
		document.querySelector("#soundEffect").className = soundClass.replace("up","off");
	} else {
		document.querySelector("#soundEffect").className = soundClass.replace("off","up");
	}
}



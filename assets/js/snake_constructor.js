function Snake(){

	//location
	this.curr_dir = "right";
	this.pos = [{x:5,y:1},//snake body - gets added to and removed from so easiest to have this be an array
				{x:4,y:1},
				{x:3,y:1},
				{x:2,y:1}];
	this.speed = {x:1,y:0};//current direction is right so setting current speed to be one to the right

	//sound effects
	this.eat = "./assets/sounds/gulp.mp3";//sound effects that are files 
	this.hit = "./assets/sounds/boing.mp3";
	this.soundEffects = true;

	//game stats
	this.score = 0;
	this.level = 1;
	this.berryEaten = false;

	//bonus
	this.collision = true;
	this.bonusLevel = 8;
	this.freeze_game = false;

	//bonus songs
	this.currSong = new Audio("./assets/sounds/i will survive.mp3");
	this.isPlaying = false;
	this.firstStart = false;//for when the player reaches a certain level and i want to automatically play music

	this.changeDir = function(speed){//called whenever a directional arrow key is pressed
		this.speed.x = speed.x;
		this.speed.y = speed.y;
	}

	//snake moves in time intervals, so this.update and this.draw are called every time interval - this.update is the next location that the snake is about to move in
	this.update = function(){
		var head = this.pos[0];
		var speed = this.speed;
		var nextLoc = {x:head.x + speed.x,y:head.y + speed.y};
		
		if(nextLoc.x==food.x && nextLoc.y==food.y){//nextLoc is the location that the snake is just about to move in, so if it is a berry, this will increment score and body length
			this.pos.unshift(nextLoc);//push nextLoc to head
			this.score++;//update score
			this.levelChecker();//check score against new level score and increment level if appropriate
			updateStats();//change dom to reflect new score and level
			this.playSound(this.eat);//play eating sound effect
			food.createFood();//generate new randomly located food piece
		} else if(nextLoc.x < canvas.width/scale_x && nextLoc.x != -1 && nextLoc.y < canvas.height/scale_y && nextLoc.y != -1 && !objInSnake(nextLoc)){
			//if nextLoc is just a regular ol' new location
			this.pos.unshift(nextLoc);//push new head to front of array
			this.pos.pop();//remove tail loc
		} else {//this is when either the nextLoc is where part of the snake is or where a wall is
			if(this.collision){//when bonus level has been reached, user can toggle collision. if collision is false, then this won't run and player will have to change direction to move any further
				gameOver();//but, if collision is true, then at this point the game is over, so run game over function
				this.playSound(this.hit);//play hit wall/snake sound
			}
		}
		
		moveCounter=0;//reset to 0 so that next move is spaced out appropriately

	}

	this.draw = function(){//function for drawing canvas
		//first layer - background
		gradient = context.createLinearGradient(0,0,canvas.width,canvas.height);
		gradient.addColorStop("0","#02260F");//starting point denoted by 0
		gradient.addColorStop(".5","#331D0C");//ending point denoted by 1
		//Fill Background with Gradient
		context.fillStyle = gradient;
		context.fillRect(0,0,canvas.width,canvas.height);
		//second layer - snake
		context.fillStyle = "white";
		for (var i = 0 ; i < this.pos.length ; i ++){
			context.fillRect(this.pos[i].x,this.pos[i].y,1,1);
		}
		//third layer - berry
		context.fillStyle = food.color;
		context.fillRect(food.x,food.y,1,1);
		context.shadowBlur = 20;
		context.shadowColor = food.color;
	}

	this.levelChecker = function (){//function for checking level to see if user has progressed to next level
		if ( this.score > 10 * this.level){//level should only increment every 10 berries
			this.level++;
			moveInterval -= 20;//decrement moveInterval to make snake move faster each level
			if(this.level>=this.bonusLevel){//play song and show bonus features if bonus level reached!
				!this.firstStart? this.playSong(true):console.log("already playing");
				document.querySelector("#bonus").style.display="block";
			} else {
				document.querySelector("#bonus").style.display="none";
			}
		}
	}

	this.playSound = function(sound){//function to play sound effects only if user has not toggled them to off
		if(this.soundEffects){	
			var audio = new Audio(sound);
			audio.play();
		}
	}

	this.currSong.onended = function(){//when song has ended, play next one
		var songs = ["i will survive","the distance"];
		if(this.src.indexOf("survive")>-1){
			this.src = "./assets/sounds/" + songs[1] + ".mp3";
		} else {
			this.src = "./assets/sounds/" + songs[0] + ".mp3";
		}
		this.play();
	}

	this.playSong = function(initial){//functionality for playing next song//either pause or play
		if(initial){
			if(!this.isPlaying){
				this.currSong.play();
				this.isPlaying = true;
			}
		} else {
			if (this.isPlaying) {
				this.currSong.pause()
				this.isPlaying = false;
			} else {
				this.currSong.play();
				this.isPlaying = true;
			}
		}
	}

	this.backgroundChanger = function(){//bonus feature - change background to random unsplash background
		document.querySelector("#stats").style.backgroundColor = "#3E606F";
		document.querySelector("#bonus").style.backgroundColor = "#3E606F";
		document.querySelector("body").style.backgroundImage="url('https://source.unsplash.com/random/?n="+Math.random()+"')";
	}

}

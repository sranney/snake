function Food(pos){//constructor for new food object
	this.x = pos.x;//location passed when creating new food object has two components x and y
	this.y = pos.y;
	this.color = "#44A68A";//first color of food
	this.colorArr = ["#44A68A","#E877FC","#0077FC","#FF9BFE","#FF0078","#FFFE5B","#FFA75B","#B24CEB"];//for variation in colors
	//color array for food
	this.createFood = function(){//creation of new food - finds random location on canvas that is not occupied by snake object and sets color of food to be a random color from the color array
		snake.berryEaten = false;
		this.x = Math.floor(Math.random()*40+1);
		this.y = Math.floor(Math.random()*40+1);
		let foodLoc = {};//to pass food location to objInSnake function
		foodLoc.x = this.x;
		foodLoc.y = this.y;
		if(objInSnake(foodLoc)){//if the determined location for the food array is occupied by the snake, then call the createFood function recursively until it isn't a space occupied by the snake
			this.createFood();
		} else {
			this.color = this.colorArr[Math.floor(Math.random()*this.colorArr.length)];//only set color once whenever this function is called
		}
	}

}
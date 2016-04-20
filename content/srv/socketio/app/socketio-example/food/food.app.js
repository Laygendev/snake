/*

Copyright (C) 2016  Jimmy LATOUR
http://labodudev.fr

*/
module.exports.food = new food();

var wf = WF();

function food()
{
	var self = this;
	this.foods = [];
	this.foodToAdd = 1000;

	this.code = function(socket) {
	}

	this.getFoods = function() {
		return self.foods;
	}

	this.addFood = function(n) {
		self.foodToAdd = n;
	}

  this.createFood = function(toAdd) {
    var radius = 10;
    while (self.foodToAdd) {
      var position = {
        x: Math.floor(Math.random() * (wf.CONF['SNAKE_CONF'].gameWidth - 10 - 10)) + 10,
        y: Math.floor(Math.random() * (wf.CONF['SNAKE_CONF'].gameHeight - 10 - 10)) + 10
      };

      self.foods.push({
        x: position.x,
        y: position.y,
      });

      self.foodToAdd--;
    }
  }

	this.gameLoop = function() {

		if (self.foodToAdd > 0) {
      self.createFood(self.foodToAdd);
    }
	}
}

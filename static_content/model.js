function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }
function distance(a, b){return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);}

class Stage {
	constructor(canvas){
		this.canvas = canvas;
	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.items=[];
		this.participants=[];
		this.walls=[];
		this.bullets=[];
		this.zones=[];
		this.player=null; // a special actor, the player
		this.game = false;
		this.score = 0;
        this.interval = 0;
        // Size of the map
		this.width=1600;
		this.height=1600;

        // Size of the canvas window
        this.windowW = this.canvas.width;
        this.windowH = this.canvas.height;

        // Offset from the window of the top-left corner
        this.off = new Pair(this.width / 2 - this.windowW / 2, this.height / 2 - this.windowH / 2);

		// Add the player 
		this.addPlayer(new Player(this, new Pair(Math.floor(this.width/2), Math.floor(this.height/2))));

		// Add in some Balls
		var total=0;
		while(total>0){
			var x=Math.floor((Math.random()*this.width*2) - this.width); //random x coordinate on canvas
			var y=Math.floor((Math.random()*this.height*2) - this.width); //random y coordinate on canvas
			if(this.getActor(x,y)===null){
				var velocity = new Pair(5, 5); //speed of ball
				var red=randint(255), green=randint(255), blue=randint(255);
				var radius = 30;
				var alpha = Math.random();
				var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y); //starting position of ball
				var b = new Ball(this, position, velocity, colour, radius);
				this.addActor(b);
				total--;
			}
		}

		// Add Health item
		var total = 5;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var healthitem = new Heal(this, new Pair(x,y));
				this.addItem(healthitem);
				total--;
			}
		}

		// Add Ammo item
		var total = 5;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var ammoitem = new Ammo(this, new Pair(x,y));
				this.addItem(ammoitem);
				total--;
			}
		}

        // Add breakable Walls
        var total = 10;
        var heal = 5;
        var type = 1;
        while(total>0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));
            if(this.getActor(x,y)===null){
                var wallitem = new breakWall(this, new Pair(x,y), 30, type);
                this.addWall(wallitem);
                total--;
                heal--;
                if(heal <= 0){
                    type = 0;
                }
            }
        }

		// Add unbreakable Walls
		var total = 10;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var wallitem = new unbreakWall(this, new Pair(x,y), 30);
				this.addWall(wallitem);
				total--;
			}
		}

		// Add enemies
		total = 5;
        while(total>0){
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
            if(this.getActor(x,y)===null){
            	this.addParticipants(new Enemy(this, new Pair(x, y)));
            	total--;
            }
        }  

	}


	gameover(doc){
		if(this.player.hp <= 0){
			doc.removeEventListener('keydown', moveByKey);
			doc.removeEventListener('keyup', moveByKey);
			this.canvas.removeEventListener('mousedown', shoot);
			this.canvas.removeEventListener('mousemove', setDirection);
			this.game = true;
		}

	}
	// Participants
	addParticipants(part){
		this.participants.push(part);
		this.addActor(part);
	}

	removeParticipants(part){
		var index = this.participants.indexOf(part);
        if (index != -1) {
            this.participants.splice(index, 1);
        }
        this.removeActor(part);
	}

	// Player
	addPlayer(player){
		this.addParticipants(player);
		this.player=player;
	}

	removePlayer(){
		this.removeParticipants(this.player);
		this.player=null;
	}

	// Actor
	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Item
	addItem(item){
		this.items.push(item);
		this.addActor(item);
	}

	removeItem(item){
		var index=this.items.indexOf(item);
		if(index!=-1){
			this.items.splice(index,1);
		}
		this.removeActor(item);
	}

	// Wall
	addWall(wall){
		this.walls.push(wall);
		this.addActor(wall);
	}

	removeWall(wall){
		var index=this.walls.indexOf(wall);
		if(wall instanceof breakWall){
            var pos = wall.position;
            var zone_type = wall.zone;
            this.addZone(new Zone(this, pos, zone_type));
        }
		if(index!=-1){
			this.walls.splice(index,1);
		}
		this.removeActor(wall);

	}

	// Zone
	addZone(z){
        this.zones.push(z);
        this.addActor(z);
    }

    removeZone(z){
        var index=this.zones.indexOf(z);
        if(index!=-1){
            this.zones.splice(index,1);
        }
        this.removeActor(z);
    }

	// Bullet
	addBullet(bullet){
		this.bullets.push(bullet);
		this.addActor(bullet);
	}

	removeBullet(bullet){
		var index=this.bullets.indexOf(bullet);
		if(index!=-1){
			this.bullets.splice(index,1);
		}
		this.removeActor(bullet);
	}

	// Take one step in the animation of the gamea.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		this.interval = (this.interval + 1) % 100 ;
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
		if(this.interval == 0){
			// Add enemies
			var total = 2;
			while(total>0){
				var x = Math.floor((Math.random() * this.width));
				var y = Math.floor((Math.random() * this.height));
				if(this.getActor(x,y)===null){
					this.addParticipants(new Enemy(this, new Pair(x, y)));
					total--;
				}
        	}  
			// Add Ammo item
			var total = 2;
			while(total>0) {
				var x = Math.floor((Math.random() * this.width));
				var y = Math.floor((Math.random() * this.height));
				if(this.getActor(x,y)===null){
					var ammoitem = new Ammo(this, new Pair(x,y));
					this.addItem(ammoitem);
					total--;
				}
			}
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');

        // Clear the canvas so it doesn't stay on the canvas
        context.clearRect(0,0, this.windowW, this.windowH);

        // map boundary
        context.beginPath();
        context.strokeStyle= "#000";
        context.rect(0-this.off.x, 0-this.off.y, this.width, this.height);
		context.stroke();

		//draw all actors
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}
		

		context.fillStyle = "black";
		context.font = "15px Times New Roman";
		// player info displayed on top left of player canvas
		context.fillText("HP = " + this.player.hp, 50,50);
		context.fillText("ammo = " + this.player.ammo, 50,80);
		context.fillText("Score = " + this.score, 200,80);
		if(this.player.hp <= 0){
			context.fillStyle = "red";
			context.fillText("GAME OVER" , 400,400);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}

    getWindowSize() {
        return new Pair(this.windowW, this.windowH);
    }

    getoff() {
        return this.off;
    }

    setoff(pos) {
        this.off.x = pos.x;
        this.off.y = pos.y;
    }

	getActors() {
		return this.actors;
	}

	getItems() {
		return this.items;
	}

	getParticipants(){
		return this.participants;
	}

	getWalls(){
		return this.walls;
	}

	getBullets(){
		return this.bullets;
	}
    
} // End Class Stage

class Pair {
	constructor(x,y){
		this.x=x; 
        this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
} // End Class Pair

class Ball {
	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.hp = 100;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	step(){
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
			
		// bounce off the walls
		if(this.position.x<-this.stage.width){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<-this.stage.height){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
	}
} // End Class Ball

class Player {
	constructor(stage, position) {
		this.stage = stage;
        this.position = position;
        this.size = 30;
		this.hp = 100;
		this.ammo = 50;
        this.moveTo = new Pair(0,0);
		this.colour= 'rgba('+randint(255)+','+randint(255)+','+randint(255)+','+100+')';
        this.velocity = 5;
		this.direction = new Pair(0,0);
		this.gun = "pistol";
	}

	move(x, y) {
        this.moveTo.x = x;
        this.moveTo.y = y;
	}

    intPosition() {
        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
    }

	getSize(){
		return this.size;
	}

    getHp() {
        return this.hp;
    }

    getAmmo() {
        return this.ammo;
    }

	collision(actor) {
		// HP + 10 when collides with a health item
		if(actor instanceof Heal) {
			this.hp += 10;
			this.stage.removeItem(actor);
		}

		// Ammo + 10 when collides with a ammo item
		if(actor instanceof Ammo) {
			this.ammo += 10;
			this.stage.removeItem(actor);
		}

		// heal or damage on zones
		if(actor instanceof Zone) {
            if(actor.type == 1){
                this.hp += 1;
            }
            else{
                this.hp -= 1;
            }
        }

		// stop movement when collides with the wall
		if(actor instanceof breakWall || actor instanceof unbreakWall) {
			var d = (this.size + actor.size) / 2;
            if (this.moveTo.x < 0) {
                if (!(this.position.y < actor.position.y - actor.size / 2 && this.moveTo.y > 0 || this.position.y > actor.position.y + actor.size / 2 && this.moveTo.y < 0)) {
                    if (actor.position.x <= this.position.x && this.position.x - actor.position.x < d) {
                        this.position.x = actor.position.x + d;
                    }
                }
            }
            if (this.moveTo.x > 0) {
                if (!(this.position.y < actor.position.y - actor.size / 2 && this.moveTo.y > 0 || this.position.y > actor.position.y + actor.size / 2 && this.moveTo.y < 0)) {
                    if (this.position.x <= actor.position.x && actor.position.x - this.position.x < d) {
                        this.position.x = actor.position.x - d;
                    }
                }
            }
            if (this.moveTo.y < 0) {
                if (!(this.position.x < actor.position.x - actor.size / 2 && this.moveTo.x > 0 || this.position.x > actor.position.x + actor.size / 2 && this.moveTo.x < 0)) {
                    if (actor.position.y <= this.position.y && this.position.y - actor.position.y < d) {
                        this.position.y = actor.position.y + d;
                    }
                }
            }
            if (this.moveTo.y > 0) {
                if (!(this.position.x < actor.position.x - actor.size / 2 && this.moveTo.x > 0 || this.position.x > actor.position.x + actor.size / 2 && this.moveTo.x < 0)) {
                    if (this.position.y <= actor.position.y && actor.position.y - this.position.y < d) {
                        this.position.y = actor.position.y - d;
                    }
                }
            }
		}
	}

	shoot() {
		if(this.gun == "pistol") {
			if(this.ammo > 0) {
				this.stage.addBullet(new pistol(this.stage, new Pair(this.position.x, this.position.y), this.direction, this));
				this.ammo -= 1;
			}
		} else if(this.gun == "shotgun") {
			if(this.ammo > 0) {
				this.stage.addBullet(new shotgun(this.stage, new Pair(this.position.x, this.position.y), this.direction - 30, this));
				this.stage.addBullet(new shotgun(this.stage, new Pair(this.position.x, this.position.y), this.direction, this));
				this.stage.addBullet(new shotgun(this.stage, new Pair(this.position.x, this.position.y), this.direction + 30, this));
				this.ammo -= 3;
			}
		}
	}

	setDirection(direction) {
		this.direction = direction;
	}

	step(){
		if(this.hp <= 0) {
			this.stage.removeParticipants(this);
		}

        // Move Player
        this.position.x = this.position.x + this.velocity * this.moveTo.x
        this.position.y = this.position.y + this.velocity * this.moveTo.y

        // Collision with the map boundary
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        if (this.position.x > this.stage.width) {
            this.position.x = this.stage.width;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        }
        if (this.position.y > this.stage.height) {
            this.position.y = this.stage.height;
        }

        // Set new window offset
        this.stage.setoff(new Pair(this.position.x - this.stage.getWindowSize().x / 2, this.position.y - this.stage.getWindowSize().y / 2));
	}

    draw(context){
        var offs = this.stage.getoff();
        context.fillStyle = "#1F77B4";

        // Center the player to the window
        context.save();
        context.translate(this.position.x - offs.x, this.position.y - offs.y);
        context.rotate(Math.atan2(this.direction.y, this.direction.x));
        context.beginPath();
        context.rect(-this.size/2,-this.size/2,this.size,this.size);
        context.fill();

        context.restore();
        
        context.save();
        context.translate(this.position.x - offs.x, this.position.y - offs.y);
        context.rotate(Math.atan2(this.direction.y, this.direction.x) + (Math.PI));
        context.beginPath();
        context.fillStyle = "#000";
        context.arc(-this.size/2,0,this.size / 4, 0, 2 * Math.PI, false);
        context.fill();  

        context.restore();

    }

} // End Class Player

class Item {
	constructor(stage, position, size, colour) {
		this.stage = stage;
        this.position = position;
        this.size = size;
		this.colour = colour;
	}

	getSize(){
		return this.size;
	}

	step() {
		var part = this.stage.getParticipants();
		for (var i = 0; i < part.length; i++) {
			var dx = part[i].position.x - this.position.x;
			var dy = part[i].position.y - this.position.y;
			if (Math.sqrt(dx*dx+dy*dy) < (this.size + part[i].getSize()) / 2) {
				part[i].collision(this);
			}
		}
	}

	draw(context) {
		var offs = this.stage.getoff();
		var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);
		context.beginPath();
        context.fillStyle = this.colour;
        context.arc(pos.x, pos.y, this.size / 2, 0, 2 * Math.PI, false);
        context.fill();
	}
}


class Heal extends Item {
	constructor(stage, position) {
        super(stage, position, 24, "rgba(100, 0, 0, 0.5)");
    }
}

class Ammo extends Item {
	constructor(stage, position) {
        super(stage, position, 24, "rgba(0, 100, 0, 0.5)");
    }
}

class Walls {
	constructor(stage, position, size, colour) {
		this.stage=stage;
		this.position=position;
		this.size=size;
		this.colour=colour;
	}

	step() {
	}

	draw() {
	}

	getSize(){
		return this.size;
	}

}

class breakWall extends Walls {
    constructor(stage, position, size) {
        super(stage, position, size);
        this.colour = "#e5dd27";
        this.hp = 2;
    }

	step() {
		if(this.hp <= 0) {
			this.stage.removeWall(this);
		}
		var part = this.stage.getParticipants();
		for (var i = 0; i < part.length; i++) {
			var dx = part[i].position.x - this.position.x;
			var dy = part[i].position.y - this.position.y;
			if (Math.abs(dx) < (this.size + part[i].getSize()) / 2 && Math.abs(dy) < (this.size + part[i].getSize()) / 2) {
				part[i].collision(this);
			}
		}
	}

	draw(context) {
		var offs = this.stage.getoff();
        var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);
        context.beginPath();
        context.strokeStyle = this.colour;
        context.rect(pos.x - this.size / 2, pos.y - this.size / 2, this.size, this.size);
        context.stroke();
        context.beginPath();
        context.fillStyle = "rgba(255, 100, 0, 1)";
        context.fillRect(pos.x - this.size / 2, pos.y - this.size / 2, this.size, this.size);
        context.fill();
	}
}

class unbreakWall extends Walls {
    constructor(stage, position, size) {
        super(stage, position, size);
        this.colour = "#1f1f2e";
    }

	step() {
		var part = this.stage.getParticipants();
		for (var i = 0; i < part.length; i++) {
			var dx = part[i].position.x - this.position.x;
			var dy = part[i].position.y - this.position.y;
			if (Math.abs(dx) < (this.size + part[i].getSize()) / 2 && Math.abs(dy) < (this.size + part[i].getSize()) / 2) {
				part[i].collision(this);
			}
		}
	}

	draw(context) {
		var offs = this.stage.getoff();
        var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);
        context.beginPath();
        context.strokeStyle = this.colour;
        context.rect(pos.x - this.size / 2, pos.y - this.size / 2, this.size, this.size);
        context.stroke();
        context.beginPath();
        context.fillStyle = "rgba(10, 30, 55, 1)";
        context.fillRect(pos.x - this.size / 2, pos.y - this.size / 2, this.size, this.size);
        context.fill();
	}
}

class Bullet {
	constructor(stage, position, direction, shooter) {
		this.stage = stage;
		this.position = position;
		this.direction = direction;
		this.shooter = shooter;
		this.size=10;
		this.velocity=0.001;
	}

	intPosition() {
        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
    }

	step(){

		this.direction.normalize();

        this.position.x = this.position.x + this.velocity * this.direction.x;
        this.position.y = this.position.y + this.velocity * this.direction.y;
        this.range -= this.velocity;
        if (this.range <= 0) {
            this.stage.removeBullet(this);
        }

        if (this.position.x > 0 && this.position.x < this.stage.width && this.position.y > 0 && this.position.y < this.stage.height) {
            this.intPosition();
        } else {
            this.stage.removeBullet(this);
        }

        var part = this.stage.getParticipants();
        for (var i = 0; i < part.length; i++) {
            var dx = part[i].position.x - this.position.x;
            var dy = part[i].position.y - this.position.y;
            if (part[i] !== this.shooter && Math.sqrt(dx*dx+dy*dy) < (part[i].getSize() + this.size) / 2) {
                this.stage.removeBullet(this);
				if (part[i] instanceof Enemy || part[i] instanceof Player) {
                    part[i].hp -= 10;
                }
            }
        }
        var walls = this.stage.getWalls();
        for (var i = 0; i < walls.length; i++) {
            var dx = walls[i].position.x - this.position.x;
            var dy = walls[i].position.y - this.position.y;
            if (Math.abs(dx) < (this.size + walls[i].getSize()) / 2 && Math.abs(dy) < (this.size + walls[i].getSize()) / 2) {
                this.stage.removeBullet(this);
                if (walls[i] instanceof breakWall) {
                    walls[i].hp -= 1;
                }
            }
        }
	}

	draw(context) {
		var offs = this.stage.getoff();
        var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);
        context.beginPath();
        context.fillStyle = "#F00";
        context.arc(pos.x, pos.y, this.size / 2, 0, 2 * Math.PI, false);
        context.fill();
	}
}

class pistol extends Bullet {
	constructor(stage, position, direction, shooter) {
        super(stage, position, direction, shooter);
        this.size = 10;
        this.range = 500;
        this.velocity = 15;
    }
}

class shotgun extends Bullet {
	constructor(stage, position, direction, shooter) {
        super(stage, position, direction, shooter);
        this.size = 20;
        this.range = 300;
        this.velocity = 25;
    }
}

class Enemy extends Player {

	constructor(stage, position){
		super(stage, position);


		this.hp = 10;
		this.moveTo = new Pair(randint(2) - 1, randint(2)-1);
		this.direction = this.moveTo;
		this.colour= 'rgba('+randint(255)+','+randint(255)+','+randint(255)+','+100+')';
        this.velocity = 1;
		this.direction = new Pair(randint(20) - 10, randint(20)-10);
		this.size = 20;
		this.interval = 12;

	}
	shoot() {

		this.stage.addBullet(new pistol(this.stage, new Pair(this.position.x, this.position.y), this.direction, this));

	}
	collision(actor){
		if(actor instanceof Bullet) {
			this.hp -= 10;
			this.stage.removeBullet(actor);
		}

		// stop movement when collides with the wall
		if(actor instanceof Walls) {
			var d = (this.size + actor.size) / 2;
			if (this.moveTo.x < 0) {
				if (!(this.position.y < actor.position.y - actor.size / 2 && this.moveTo.y > 0 || this.position.y > actor.position.y + actor.size / 2 && this.moveTo.y < 0)) {
					if (actor.position.x <= this.position.x && this.position.x - actor.position.x < d) {
						this.position.x = actor.position.x + d;
						this.moveTo.x = -this.moveTo.x;
					}
				}
			}
			if (this.moveTo.x > 0) {
				if (!(this.position.y < actor.position.y - actor.size / 2 && this.moveTo.y > 0 || this.position.y > actor.position.y + actor.size / 2 && this.moveTo.y < 0)) {
					if (this.position.x <= actor.position.x && actor.position.x - this.position.x < d) {
						this.position.x = actor.position.x - d;
						this.moveTo.x = -this.moveTo.x;
					}
				}
			}
			if (this.moveTo.y < 0) {
				if (!(this.position.x < actor.position.x - actor.size / 2 && this.moveTo.x > 0 || this.position.x > actor.position.x + actor.size / 2 && this.moveTo.x < 0)) {
					if (actor.position.y <= this.position.y && this.position.y - actor.position.y < d) {
						this.position.y = actor.position.y + d;
						this.moveTo.y = -this.moveTo.y;
					}
				}
			}
			if (this.moveTo.y > 0) {
				if (!(this.position.x < actor.position.x - actor.size / 2 && this.moveTo.x > 0 || this.position.x > actor.position.x + actor.size / 2 && this.moveTo.x < 0)) {
					if (this.position.y <= actor.position.y && actor.position.y - this.position.y < d) {
						this.position.y = actor.position.y - d;
						this.moveTo.y = -this.moveTo.y;
					}
				}
			}
		}
	}
	step(){
		if(this.hp <= 0) {
			this.stage.removeParticipants(this);
			this.stage.score += 10;
		}

		if(this.stage.player != null && distance(this.position, this.stage.player.position) < 500){
			this.moveTo.x = this.stage.player.position.x - this.position.x;
			this.moveTo.y = this.stage.player.position.y - this.position.y;
			this.moveTo.normalize(); 
			this.direction = this.moveTo;
			if (this.interval == 20){
				this.shoot();

			}
		}
		this.interval = (this.interval+1)% 21;

        // Move Player
        this.position.x = this.position.x + this.velocity * this.moveTo.x;
        this.position.y = this.position.y + this.velocity * this.moveTo.y;

        // Collision with the map boundary 
        if (this.position.x < 0) {
            this.position.x -= (this.moveTo.x*this.velocity);
			this.moveTo.x = -this.moveTo.x;
        }
        if (this.position.x > this.stage.width) {
			this.position.x -= (this.moveTo.x*this.velocity);
			this.moveTo.x = -this.moveTo.x;
        }
        if (this.position.y < 0) {
			this.position.y -= (this.moveTo.y*this.velocity);
			this.moveTo.y = -this.moveTo.y;
        }
        if (this.position.y > this.stage.height) {
			this.position.y -= (this.moveTo.y*this.velocity);
			this.moveTo.y = -this.moveTo.y;
        }
	}
	draw(context){
        var offs = this.stage.getoff();
        context.fillStyle = "#000";

		var offs = this.stage.getoff();
		var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);

        context.save();	
		context.beginPath();
		context.rect(pos.x,pos.y,20,20); 
        context.fill();
		context.restore();

	}


}

class Zone extends Ball{

    constructor(stage, pos, type){
        var color = "#0000";

        if (type == 1){
            color = "#21BB58";
        }
        else{
            color = "#D62728";
        }
        super(stage, pos, new Pair(0,0), color, 100);
        this.type = type;
        this.intervals = 1000;
    }


    draw(context){

        var offs = this.stage.getoff();
        var pos = new Pair(this.position.x - offs.x, this.position.y - offs.y);
        context.fillStyle = this.colour;
        context.save();
        context.globalAlpha = 0.3;
        context.beginPath(); 
        context.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI, false); 
        context.fill();   
        context.restore();

    }
    step() {
        this.intervals--;
        if(this.intervals <= 0){
            this.stage.removeZone(this);
            return;
        }
        if((this.intervals % 5) == 0){
            var part = this.stage.getParticipants();
            for (var i = 0; i < part.length; i++) {
    
                if (distance(this.position, part[i].position) < this.radius ) {
                    part[i].collision(this);
                }
            }
        }

    }

}
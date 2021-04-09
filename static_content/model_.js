class MediumStage {
	constructor(canvas){
		this.canvas = canvas;
		this.interval = 0;
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.items=[];
		this.participants=[];
		this.walls=[];
		this.bullets=[];
		this.zones=[];
		this.player=null; // a special actor, the player
        
        // Size of the map
		this.width=3000;
		this.height=3000;

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
		var total = 10;
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
		var total = 300;
		var heal = 5;
		var type = 1;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var wallitem = new breakWall(this, new Pair(x,y), 50, type);
				this.addWall(wallitem);
				total--;
				heal--;
				if(heal <= 0){
					type = 0;
				}
			}
		}

		// Add breakable Walls
		var total = 20;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var wallitem = new unbreakWall(this, new Pair(x,y), 30);
				this.addWall(wallitem);
				total--;
			}
		}

		total = 10;
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
		if(this.player === null){
			doc.removeEventListener('keydown', moveByKey);
			doc.removeEventListener('keyup', moveByKey);
			this.canvas.removeEventListener('mousedown', shoot);
			this.canvas.removeEventListener('mousemove', setDirection);
			console.log("GAMEOVERRR");
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

	addZone(z){
		this.zones.push(z);
		this.addActor(z);
	}

	removeZone(z){
		var index=this.bullets.indexOf(z);
		if(index!=-1){
			this.z.splice(index,1);
		}
		this.removeActor(z);
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
			var total = 3;
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
		if(this.player != null){
			context.fillText("HP = " + this.player.hp, 50,50);
			context.fillText("ammo = " + this.player.ammo, 50,80);
		}
		else{
			context.fillText("HP = 0", 50,50);
			context.fillText("ammo = 0" , 50,80);
			context.fillStyle = "red";
			context.fillText("GAME OVER" , 400,80);


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


class HardStage {
	constructor(canvas){
		this.canvas = canvas;
		this.interval = 0;
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.items=[];
		this.participants=[];
		this.walls=[];
		this.bullets=[];
		this.zones=[];
		this.player=null; // a special actor, the player
        
        // Size of the map
		this.width=3000;
		this.height=3000;

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
		var total = 0;
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
		var total = 20;
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
		var total = 300;
		var heal = 0;
		var type = 0;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var wallitem = new breakWall(this, new Pair(x,y), 50, type);
				this.addWall(wallitem);
				total--;
				heal--;
				if(heal <= 0){
					type = 0;
				}
			}
		}

		// Add breakable Walls
		var total = 30;
		while(total>0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if(this.getActor(x,y)===null){
				var wallitem = new unbreakWall(this, new Pair(x,y), 30);
				this.addWall(wallitem);
				total--;
			}
		}

		total = 10;
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
		if(this.player === null){
			doc.removeEventListener('keydown', moveByKey);
			doc.removeEventListener('keyup', moveByKey);
			this.canvas.removeEventListener('mousedown', shoot);
			this.canvas.removeEventListener('mousemove', setDirection);
			console.log("GAMEOVERRR");
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

	addZone(z){
		this.zones.push(z);
		this.addActor(z);
	}

	removeZone(z){
		var index=this.bullets.indexOf(z);
		if(index!=-1){
			this.z.splice(index,1);
		}
		this.removeActor(z);
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
			var total = 4;
			while(total>0){
				var x = Math.floor((Math.random() * this.width));
				var y = Math.floor((Math.random() * this.height));
				if(this.getActor(x,y)===null){
					this.addParticipants(new Enemy(this, new Pair(x, y)));
					total--;
				}
        	}  
			// Add Ammo item
			var total = 3;
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
		if(this.player != null){
			context.fillText("HP = " + this.player.hp, 50,50);
			context.fillText("ammo = " + this.player.ammo, 50,80);
		}
		else{
			context.fillText("HP = 0", 50,50);
			context.fillText("ammo = 0" , 50,80);
			context.fillStyle = "red";
			context.fillText("GAME OVER" , 400,80);


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

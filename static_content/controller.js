var stage=null;
var view = null;
var interval=null;
var mousex = null;
var mousey = null;
var credentials={ "username": "", "password":"" };
keys = {};
var currpage = "login";
var gameover = false;
var difficulty = ["Easy", "Medium", "Hard"];

function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', moveByKey);
        stage.canvas.addEventListener('mousedown', shoot);
        stage.canvas.addEventListener('mousemove', setDirection);
}
function startGame(){
	interval=setInterval(function(){ 
                stage.gameover(document);
                checkgameover(); 
                stage.step(); 
                stage.draw(); 

        }, 20);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}
function moveByKey(event){
        if(stage.player != null){
                keys[event.key] = event.type === "keydown";
                var moveMap = {
                    'a': {"dx": -1, "dy": 0},
                    's': {"dx": 0, "dy": 1},
                    'd': {"dx": 1, "dy": 0},
                    'w': {"dx": 0, "dy": -1}
                };
                var dx = 0; 
                var dy = 0;
                for (var key in keys) {
                        if(key in moveMap && keys[key]) {
                                dx += moveMap[key].dx;
                                dy += moveMap[key].dy;
                                stage.player.move(dx, dy);
                        }
                }
                // Stop infinite moving
                if(event.type == "keyup") {
                        stage.player.move(0,0);
                }
        }

}

function shoot(){
        if(stage.player != null) {
                stage.player.shoot();
        }
}

function setDirection(event) {
        if(stage.player != null){

        var r = stage.canvas.getBoundingClientRect();

        mousex = event.clientX - r.left;
        mousey= event.clientY - r.top;
        var x2 = mousex - (stage.getWindowSize().x / 2);
        var y2 = mousey - (stage.getWindowSize().y / 2);
        var dir = new Pair(x2,y2);
        dir.normalize();
        stage.player.setDirection(dir);
        }
        
}


function login(){
        if(currpage != "login") {
                switchpages("login");
                return;
        }

	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        	$("#ui_login").hide();
        	$("#ui_play").show();
                $("#navbar").show();

		setupGame();
		startGame();

        }).fail(function(err){
                console.log(credentials.username);
                console.log(credentials.password);
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                document.getElementById("loginerror").innerText = "User does not exist";
        });
}

function register(){
        if(currpage != "register") {
                switchpages("register");
                return;
        }

        credentials =  { 
            "username": $("#regusername").val(), 
            "password": $("#regpassword").val() 
        };

        var skillval = "";
        if (document.getElementById("beginner").checked) {
                skillval = "beginner";
        } else if(document.getElementById("intermediate").checked) {
                skillval = "intermediate";
        } else if(document.getElementById("advanced").checked) {
                skillval = "advanced";
        }

        var morn = "false";
        var after = "false";
        var even = "false";
        
        if (document.getElementById("time1").checked) {
                morn = "true";
        }

        if(document.getElementById("time2").checked) {
                after = "true";
        }

        if(document.getElementById("time3").checked) {
                even = "true";
        }
    
        $.ajax({
                method: "POST",
                url: "/api/register",
                data: JSON.stringify({}),
        headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                console.log("Registered!");
                switchpages("login");
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                document.getElementById("regerror").innerText = "User already exists";
        });
    }


// Using the /api/auth/test route, must send authorization header
function profile(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "GET",
                url: "/api/auth/profile",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                switchpages("profile");
                document.getElementById("profile").innerText = JSON.stringify(data);


        }).fail(function(err){

                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}


function switchpages(page) {
        if(page == "login") {
                $("#ui_login").show();
                $("#ui_register").hide();
                $("#ui_play").hide();
                $("#navbar").hide();
                $("#ui_profile").hide();
                $("#ui_leaderboard").hide();
                $("#ui_instruction").hide();
                currpage = "login";
                document.getElementById("regusername").value="";
                document.getElementById("regpassword").value="";
                document.getElementById("loginerror").innerText = "";
        } else if(page == "register") {
                $("#ui_login").hide();
                $("#ui_register").show();
                $("#ui_play").hide();
                $("#navbar").hide();
                $("#ui_profile").hide();
                $("#ui_leaderboard").hide();
                $("#ui_instruction").hide();
                currpage = "register";
                document.getElementById("username").value="";
                document.getElementById("password").value="";
                document.getElementById("regerror").innerText = "";
        } else if(page == "Profile"){
                profile();
                $("#ui_login").hide();
                $("#ui_register").hide();
                $("#ui_play").hide();
                $("#navbar").show();
                $("#ui_profile").show();
                $("#ui_leaderboard").hide();
                $("#ui_instruction").hide();
                pauseGame();
        } else if(page == "Leaderboard") {
                $("#ui_login").hide();
                $("#ui_register").hide();
                $("#ui_play").hide();
                $("#navbar").show();
                $("#ui_profile").hide();
                $("#ui_leaderboard").show();
                $("#ui_instruction").hide();
                pauseGame();
        } else if(page == "Instruction") {
                $("#ui_login").hide();
                $("#ui_register").hide();
                $("#ui_play").hide();
                $("#navbar").show();
                $("#ui_profile").hide();
                $("#ui_leaderboard").hide();
                $("#ui_instruction").show();
                pauseGame();
        } else if(page == "Play") {
                $("#ui_login").hide();
                $("#ui_register").hide();
                $("#ui_play").show();
                $("#navbar").show();
                $("#ui_profile").hide();
                $("#ui_leaderboard").hide();
                $("#ui_instruction").hide();
                startGame();
        }
}

function logout() {
        pauseGame();
        $("#ui_login").show();
        $("#ui_register").hide();
        $("#ui_play").hide();
        $("#navbar").hide();
        $("#ui_profile").hide();
        $("#ui_leaderboard").hide();
        $("#ui_instruction").hide();
        document.getElementById("username").value="";
        document.getElementById("password").value="";
        document.getElementById("loginerror").innerText = "";
        document.getElementById("regerror").innerText = "";
}

function checkgameover() {
        if(stage.game == true) {
                gameover = true;
                pauseGame();
        }
}

// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

$(function(){
        // Setup all events here and display the appropriate UI
        $("#ui_login").show();
        $("#ui_register").hide();
        $("#ui_play").hide();
        $("#navbar").hide();
        $("#ui_profile").hide();
        $("#ui_leaderboard").hide();
        $("#ui_instruction").hide();
        $("#ui_gameover").hide();

        // Login and Register page switches
        $("#loginSubmit").on('click',function(){ login(); });
        $("#RSubmit").on('click',function(){ register(); });
        $("#registerSubmit").on('click',function(){ register(); });
        $("#logSubmit").on('click',function(){ login(); });

        // Switch pages
        $("#navplay").on('click',function(){ switchpages("Play"); });
        $("#navinstruction").on('click',function(){ switchpages("Instruction"); });
        $("#navprofile").on('click',function(){ switchpages("Profile"); });
        $("#navleaderboard").on('click',function(){ switchpages("Leaderboard"); });
        $("#navlogout").on('click',function(){ logout(); });


});


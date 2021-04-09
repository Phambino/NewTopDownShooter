0// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', function (req, res,next) {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		console.log(username+" "+password);

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                		res.status(403).json({ error: 'Not authorized'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
                		res.status(403).json({ error: 'Not authorized'});
        		}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Not authorized'});
	}
});

app.post('/api/register', function (req, res) {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent!' });
      }
    try {
        // var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
        var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

        var user_pass = Buffer.from(m[1], 'base64').toString()
        m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

        var username = m[1];
        var password = m[2];

        console.log(username+" "+password);
		console.log("asdasdad");

        let sql = 'INSERT INTO ftduser VALUES ($1, sha512($2));';
            pool.query(sql, [username, password], (err, pgRes) => {
              if (err){
                        res.status(403).json({ error: 'Not authorized'});

            } else {
                res.status(200); 
                res.json({"message":"authentication success"}); 
                }
        });
    } catch(err) {
                   res.status(403).json({ error: 'Not authorized'});
    }

});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

app.post('/api/auth/profile', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/profile"}); 
});

app.use('/',express.static('static_content')); 

// All routes below /api/auth require credentials 
app.get('/api/auth/profile', function (req, res){
	console.log("got to auth/prof");
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent!' });
      }
    try {
        // var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
        var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

        var user_pass = Buffer.from(m[1], 'base64').toString()
        m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

        var username = m[1];
        var password = m[2];

        console.log(username+" "+password);
		console.log("Profileee");
		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
              if (err){
                res.status(403).json({ error: 'Not authorized'});
            } else if(pgRes.rowCount == 1) {
                res.status(200); 
				var row = pgRes.rows[0];

				console.log('all data');
				res.json({"username": `${row.username}`, "Skill": `${row.skill}`, "Birthday": `${row.bday}`, "PrevScore": `${row.prevscore}`, "HighScore": `${row.hiscore}`});       
			}
        });
    } catch(err) {
        res.status(403).json({ error: 'Not authorized'});
    }

});



app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});


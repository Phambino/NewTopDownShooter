--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE ftduser;
CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	skill VARCHAR(20),
	bday VARCHAR(20),
	morning VARCHAR(20),
	afternoon VARCHAR(20),
	evening VARCHAR(20),
	prevscore int,
	hiscore int
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'), 'beginner', '1992', 'false', 'true', 'false', 0, 0);
INSERT INTO ftduser VALUES('user2', sha512('password2'), 'advanced', '1990', 'true', 'true', 'false', 0, 0);

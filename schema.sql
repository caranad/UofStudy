DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS studyGroups CASCADE;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS user_group_rlshp;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS user_reports;
DROP TABLE IF EXISTS post_reports;
DROP TABLE IF EXISTS user_hides;

CREATE TABLE IF NOT EXISTS users
(
	id SERIAL, 
	name VARCHAR(256),
	email VARCHAR(256),
	username VARCHAR(256),
	password VARCHAR(256),
	program VARCHAR(256),
	year_of_study INTEGER,
	profile_img TEXT,
	city TEXT
);

CREATE TABLE IF NOT EXISTS studyGroups
(
	id SERIAL,
	group_name VARCHAR(256),
	description TEXT,
	location TEXT,
	room VARCHAR(256),
	day VARCHAR(256),
	time INTEGER,
	img TEXT 
);

CREATE TABLE IF NOT EXISTS tags
(
	group_id VARCHAR(256),
	tag VARCHAR(256) 
);

CREATE TABLE IF NOT EXISTS user_group_rlshp
(
	username VARCHAR(256),
	group_id INTEGER,
	role VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS posts 
(
	id SERIAL,
	group_id INTEGER,
	username VARCHAR(256),
	post TEXT,
	time TIMESTAMP,
	visibility VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS comments
(
	post_id INTEGER, 
	comment TEXT
);

CREATE TABLE IF NOT EXISTS user_reports
(
	id SERIAL,
	group_id VARCHAR(256),
	report TEXT
);

CREATE TABLE IF NOT EXISTS post_reports
(
	id SERIAL,
	group_id VARCHAR(256),
	post_id VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS user_hides
(
	id SERIAL,
	user_id VARCHAR(256),
	post_id VARCHAR(256)
);
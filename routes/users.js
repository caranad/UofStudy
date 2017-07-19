var express     = require('express');
var debug       = require('../utils/debug');
var _           = require('lodash');
var app         = express.Router();

/* GET the json data associated with a single user
 * through username query parameter.
 */
app.get('/', function(req, res){
    debug.logRequest(req);
    // TODO: more flexible than just using a single user qparam?
    var username = req.query.username;
    var query = "SELECT * FROM users WHERE username = $1";

    if (username !== undefined){
        db.query(query, username).then(function(result){
            if (result.length) {
                res.json(result);
            } else {
                res.status(404).send('User not found.');
            }
        }).catch(function(err){
            // go through errors to find the case to find the case of
            res.status(500).send('db error: ' + err.message);
        });
    } else {
        // TODO; should be 400
        res.status(404).send('username not found')
    }
});

/* POST user form data to the server for validation.
 * for logging in and registering users.
 */
app.post('/', function(req, res) {
    // TODO: validation
    // TODO: separate for login?
    debug.logRequest(req);

    // Request body extracted to an array.
    var user_data = [
        req.body.name,
        req.body.email,
        req.body.username,
        req.body.password,
        req.body.program,
        req.body.year_of_study,
        req.body.city
    ];

    db.query("INSERT INTO users (name, email, username, password, program, year_of_study, city) VALUES ($1, $2, $3, $4, $5, $6, $7)", user_data).then(function(data){
        req.session.username = req.body.username;
        res.redirect('/news');
    }).catch(function(err){
        res.status(500).send('db error: ' + err.message);
    });
});

/* PUT new user data for user from the user editing form */
app.put('/', function(req, res){
    debug.logRequest(req);
    // TODO: validation

    var query = "UPDATE users SET ";
    var i = 1;

    // At minimum, just change the name.
    if (req.session.username !== undefined){
        if (!(_.has(req.body, 'name'))){
            res.sendStatus(400);
        }

        query += _.keys(req.body).map(
            function(key) { return " " + key + " = $(" + key +"),"}
        ).reduce(function(start, key) { return start + key; }).slice(1, -1);

        query += " WHERE username = $(username)";
        console.log(query);

        db.query(query, _.merge(req.body, {username: req.session.username })).then(function(){
            res.sendStatus(200);
        }).catch(function(err){
            res.status(500).send('query error: ' + err.message);
        });
    }
    else{
        res.sendStatus(403);
    }
});

// Remove a user based on the given ID in the URL
app.delete('/', function(req, res){
    debug.logRequest(req);

    var username = req.query.username;
    if (username == undefined){
        res.status(400).send('Insert username');
    }
    else
    {
        db.query("DELETE FROM users WHERE username = $1", [username]).then(function(){
            db.query("DELETE FROM user_group_rlshp WHERE username = $1", [username]).then(function(){
                db.query("DELETE FROM posts WHERE username = $1", [username]).then(function(){
                    res.sendStatus(200);
                }).catch(function(err){
                    res.status(500).send(err.message);
                });
            }).catch(function(err){
                res.status(500).send(err.message);
            });
        }).catch(function(err){
            res.status(500).send(err.message);
        });
    }
});

/* GETS the session ID from the server of currently logged in user. */
app.get('/userData', function(req, res){
    debug.logRequest(req);
    // TODO; invalidity
    var session_usr = req.session.username;
    if (session_usr !== undefined) {
        res.json(req.session.username);
    } else {
        // not logged in
        res.status(403).send('user is not logged in');
    }
});

module.exports = app;

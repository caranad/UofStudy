var express     = require('express');
var debug       = require('../utils/debug');

var app         = express.Router();

/* GETs the list of posts in the group */
app.get('/', function(req, res)
{
    debug.logRequest(req);
    var query = "SELECT posts.id, group_id, group_name, username, post, posts.time FROM posts INNER JOIN studygroups ON posts.group_id = studygroups.id";
    var posts_data = [];
    var id = 1;

    if (req.query.group != undefined)
    {
        query += " WHERE group_id = $" + id;
        posts_data.push(req.query.group);
        id++;
    }
    if (req.query.type != undefined)
    {
        query += " AND visibility = $" + id;
        posts_data.push(req.query.type);
        id++;
    }

    query += " ORDER BY posts.time DESC";

    db.query(query, posts_data).then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        // Error from serverside
        res.status(500).send('Database Error.');
    });
});

// Add a post
app.post('/', function(req, res)
{
    debug.logRequest(req);
    var group_id = req.body.group_id;
    var username = req.session.username;
    var post_content = req.body.post_content;

    if (group_id == undefined || username == undefined || post_content == undefined)
    {
        res.status(400).send('One or more required fields are missing.');
    }
    else
    {
        if (req.body.pubpr == 'private')
        {
            db.query("INSERT INTO posts (group_id, username, post, time, visibility) VALUES ($1, $2, $3, $4, $5)", [group_id, username, post_content, new Date(), 'private']).then(function(data)
            {
                res.sendStatus(200);
            }).catch(function(err)
            {
                res.status(500).send('Database Error.');
            });
        }
        else
        {
            db.query("INSERT INTO posts (group_id, username, post, time, visibility) VALUES ($1, $2, $3, $4, $5)", [group_id, username, post_content, new Date(), 'public']).then(function(data)
            {
                res.sendStatus(200);
            }).catch(function(err)
            {
                res.status(500).send('Database Error.');
            });
        }

    }
});

// Modify a post / its owner
app.put('/', function(req, res)
{
    debug.logRequest(req);
    var group_id = req.body.group_id;
    var username = req.body.username;
    var post_content = req.body.content;

    if (!group_id || !username)
    {
        // Not authorized to
        res.status(401).send('You do not have permission to modify this post.');
    }
    if (!post_content)
    {
        res.status(400).send('Missing content to modify post.');
    }

    db.query("UPDATE posts SET post = $1 WHERE group_id = $2 AND username = $3", [post_content, group_id, username]).then(function()
    {
        res.sendStatus(200);
    }).catch(function(err)
    {
        res.status(500).send('Database Error.');
    });
});

// Delete a post from being in a group
app.delete('/', function(req, res)
{
    debug.logRequest(req);
    var group_id = req.query.group_id;
    var username = req.query.username;

    var query = "DELETE FROM posts WHERE ";
    var delete_items = [];
    var i = 1;

    if (!group_id || !username)
    {
        res.status(401).send('You do not have permission to modify this post.');
    } else {
        if (group_id) {
            query += "group_id = $" + i;
            delete_items.push(group_id);
            i++;
        }

        if (username) {
            query += " AND username = $" + i;
            delete_items.push(username);
            i++;
        }
    }

    db.query(query, delete_items).then(function()
    {
        res.sendStatus(200);
    }).catch(function(err)
    {
        res.status(500).send('Database Error.');
    });
});

/* GETs all the hidden posts for queried user id */
app.get('/hide', function(req, res) {
    debug.logRequest(req);
    if (req.session.username !== undefined) {
        // logged in
        // add post hide request to database
        var query = "SELECT post_id FROM user_hides WHERE user_id = $1";

        db.query(query, req.query.user_id).then(function(data) {
            res.json(data);
        }).catch(function (err) {
            res.status(500).send('Database Error');
        });
    } else {
        res.sendStatus(403);
    }
});


/* POST a user request to hide a post */
app.post('/hide', function(req, res) {
    debug.logRequest(req);
    if (req.session.username !== undefined) {
        // logged in
        // add post hide request to database
        var query = "INSERT INTO user_hides (user_id, post_id) VALUES ($1, $2)";
        var user_id = req.body.user_id;
        var post_id = req.body.post_id;

        db.query(query, [user_id, post_id]).then(function() {
            res.sendStatus(200);
        }).catch(function (err) {
            res.status(500).send('Database Error');
        });
    } else {
        res.sendStatus(403);
    }
});

module.exports = app;

var express     = require('express');
var debug       = require('../utils/debug');

var app         = express.Router();

app.get('/', function(req, res)
{
    debug.logRequest(req);

    var group_id = req.query.id;

    if (group_id != undefined)
    {
        db.query("SELECT posts.id, group_id, comments.username, comment FROM posts INNER JOIN comments ON posts.id = comments.post_id WHERE posts.id = $1", [group_id]).then(function(doc)
        {
            res.json(doc);
        }).catch(function(err)
        {
            console.log(err);
            res.status(404).send('Comment not found.');
        });
    }
    else
    {
        res.send(404).send('No post ID defined.');
    }
});

app.post('/', function(req, res)
{
    debug.logRequest(req);

    var username = req.session.username;
    var post_id = req.body.post_id;
    var comment = req.body.comment;

    db.query("INSERT INTO comments VALUES ($1, $2, $3)", [post_id, comment, username]).then(function()
    {
        res.sendStatus(200);
    }).catch(function(err)
    {
        res.status(400).send('Could not post comment.');
    });
});

module.exports = app;

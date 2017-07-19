var express     = require('express');
var debug       = require('../utils/debug');
var _           = require('lodash');

var app         = express.Router();


// -------------------- HELPER FUNCTIONS --------------------
function not_my_group(mine, theirs)
{
    for (var i = 0; i < mine.length; i++)
    {
        for (var j = 0; j < theirs.length; j++)
        {
            if (mine[i]['group_name'] == theirs)
            {
                return false;
            }
        }
    }

    return true;
}

function exists(responses, group)
{
    for (var i = 0; i < responses.length; i++)
    {
        if (group == responses[i])
        {
            return true;
        }
    }

    return false;
}

function add_group(responses, group)
{
    for (var i = 0; i < responses.length; i++)
    {
        if (responses[i]['group_name'] == group['group_name'])
        {
            return;
        }
    }

    responses.push(group);
}

// -------------------- HELPER FUNCTIONS --------------------

app.get('/', function(req, res)
{
    debug.logRequest(req);

   var group_id = req.query.id;
   var params = [];
   var query = "SELECT * FROM studyGroups";

   if (group_id != undefined)
   {
       query += " WHERE id = $1";
       params.push(group_id);
   }

   db.query(query, params).then(function(data)
   {
       if (data.length == 0)
       {
           res.sendStatus(404);
       }
       else
       {
           res.json(data);
       }
   }).catch(function(err)
   {
       res.status(500).send(err.message);
   });
});



app.get('/myRole', function(req, res)
{
    debug.logRequest(req);

    var group_id = req.query.id;
    var username = req.session.username;

    db.query("SELECT role FROM user_group_rlshp WHERE group_id = $1 AND username = $2", [group_id, username]).then(function(doc)
    {
        req.session.role = doc[0]['role'];
        res.send(req.session.role);
    }).catch(function(err)
    {
        res.status(404).send('User role does not exist.');
    });
});


/* GETs the studygroups of a qiven user */
app.get('/myGroups', function(req, res)
{
    debug.logRequest(req);

    var q = "SELECT group_id, img, group_name FROM user_group_rlshp ug LEFT JOIN studyGroups sg ON ug.group_id = sg.id WHERE username = $1";

    db.query(q, [req.session.username]).then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.sendStatus(500);
    });
});



/* GETs id, groupnames and locations of all studygroups in DB. */
app.get('/locations', function(req, res)
{
    debug.logRequest(req);
    db.query("SELECT id, group_name, location FROM studyGroups").then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.sendStatus(404);
    });
});



app.get('/recommended', function(req, res)
{
    debug.logRequest(req);

    db.query("DROP VIEW IF EXISTS myGroups; CREATE VIEW myGroups AS SELECT ug.group_id, group_name FROM user_group_rlshp ug LEFT JOIN studyGroups sg ON ug.group_id = sg.id WHERE username = $1", [req.session.username]).then(function()
    {
        db.query("SELECT * FROM myGroups").then(function(doc)
        {
            var myGroups = doc;

            db.query("SELECT tag FROM myGroups INNER JOIN tags ON myGroups.group_name = tags.group_id").then(function(doc)
            {
                var tags = doc;

                // Check all other groups besides yours to see which ones have that tag
                db.query("DROP VIEW IF EXISTS theirGroups; CREATE VIEW theirGroups AS SELECT id, group_name, img, tag FROM studyGroups s INNER JOIN tags t ON s.group_name = t.group_id").then(function(doc)
                {
                    db.query("SELECT * FROM theirGroups").then(function(doc)
                    {
                        var groups = doc;
                        var responses = [];

                        for (var i = 0; i < groups.length; i++)
                        {
                            for (var j = 0; j < tags.length; j++)
                            {
                                if (groups[i]['tag'] == tags[j]['tag']
                                    && not_my_group(myGroups, groups[i]['group_name'])
                                    && !exists(responses, groups[i]['group_name']))
                                {
                                    add_group(responses, {
                                        group_name: groups[i]['group_name'],
                                        img: groups[i]['img'],
                                        group_id: groups[i]['id']
                                    });
                                }
                            }
                        }

                        res.json(responses);
                    }).catch(function(err)
                    {
                        res.status(404).send('Could not get groups.');
                    });
                }).catch(function(err)
                {
                    res.status(404).send('Could not get groups you do not belong in.');
                });
            }).catch(function(err)
            {
                res.status(404).send('Could not get tags.');
            });
        }).catch(function(err)
        {
            res.status(404).send('Could not get your groups.');
        });
    }).catch(function(err)
    {
        res.status(404).send('Could not create view');
    });
});



// Insert a study group into the database; in other words, register it
app.post('/', function(req, res)
{
    debug.logRequest(req);

   var time = "";

   if (req.body.am_pm == "AM")
   {
       time = req.body.time;
   }
   else
   {
       time = parseInt(req.body.time) + 12;
   }

   var information = [
       req.body.groupname,
       req.body.description,
       req.body.room,
       req.body.location,
       req.body.day,
       time
   ];

   var result;

   // Check if the group name already exists
   db.query("SELECT * FROM studyGroups WHERE group_name = $1", [req.body.groupname]).then(function(data)
   {
       if (data.length == 0)
       {
           // Register the group
           db.query("INSERT INTO studyGroups (group_name, description, room, location, day, time) VALUES ($1, $2, $3, $4, $5, $6)", information).then(function()
           {
               db.query("SELECT id FROM studyGroups WHERE group_name = $1", [req.body.groupname]).then(function(data)
               {
                   var id = data[0]['id'];
                   result = data;

                   // Mark the logged in member as a part of the study group
                   db.query("INSERT INTO user_group_rlshp VALUES ($1, $2, $3)", [req.session.username, id, 'group_admin']).then(function()
                   {
                      res.redirect('/group?id=' + id);
                   }).catch(function(err)
                   {
                       res.status(500).send(err.message);
                   });
               });

               var tags = req.body.tags.split(",");
               for (var i = 0; i < tags.length; i++)
               {
                   var tag = tags[i].trim();
                   db.query("INSERT INTO tags VALUES ($1, $2)", [req.body.groupname, tag]).then(function(){}).catch(function(err)
                   {
                       res.status(500).send(err.message);
                   });
               }
           }).catch(function(err)
           {
               res.status(500).send(err.message);
           });
       }
       else
       {
           // This group already exist error
           res.status(400).send('This group name already exists in our database!');
       }
   }).catch(function(err)
   {
       res.status(500).send(err.message);
   });
});



// Modify the name of the study group
app.put('/', function(req, res)
{
    debug.logRequest(req);

   var id = req.query.id;
   var query = "UPDATE studygroups SET";
   var i = 1;
   var params = [];

   if (id == undefined)
   {
       res.status(400).send('pass id of the group to modify');
   }
   else
   {
       // Build query here
       if (req.body.groupname != undefined)
       {
           params.push(req.body.groupname);
           query += " group_name = $" + i;
           i++;
       }
       if (req.body.description != undefined)
       {
           params.push(req.body.description);
           query += ", description = $" + i;
           i++;
       }
       if (req.body.room != undefined)
       {
           params.push(req.body.room);
           query += ", room = $" + i;
           i++;
       }
       if (req.body.location != undefined)
       {
           params.push(req.body.location);
           query += ", location = $" + i;
           i++;
       }
       if (req.body.day != undefined)
       {
           params.push(req.body.day);
           query += ", day = $" + i;
           i++;
       }
       if (req.body.time != undefined && req.body.am_pm != undefined)
       {
           params.push(req.body.time + " " + req.body.am_pm);
           query += ", time = $" + i;
           i++;
       }
   }

   query += " WHERE id = $" + i;
   params.push(id);

   db.query(query, params).then(function()
   {
       res.sendStatus(200);
   }).catch(function(err)
   {
       res.status(500).send(err.message);
   });
});

// Remove the study group
app.delete('/', function(req, res)
{
    debug.logRequest(req);

   var id = req.query.id;

   if (id == undefined)
   {
       res.sendStatus(404);
   }
   else
   {
       db.query("DELETE FROM studygroups WHERE id = $1", [id]).then(function()
       {
            db.query("DELETE FROM user_group_rlshp WHERE group_id = $1", [id]).then(function()
            {
                res.sendStatus(200);
            });
       }).catch(function(err){
           res.status(500).send(err.message);
       });
   }
});


app.get('/members', function(req, res)
{
    debug.logRequest(req);

    var id = req.query.id;

    db.query("SELECT * FROM user_group_rlshp INNER JOIN users ON user_group_rlshp.username = users.username WHERE group_id = $1", [id]).then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.sendStatus(404);
    });
});



// Add another team member as part of group with id group_id
app.post('/addMember', function(req, res)
{
    debug.logRequest(req);

   var user = req.body.username;
   var group_id = req.body.id;

   if (user == undefined)
   {
       res.status(400).send('Please enter a username.');
   }
   else
   {
       // Does the person exist?
       db.query("SELECT username FROM users WHERE username = $1", [user]).then(function(data)
       {
           if (data.length == 0)
           {
               res.status(404).send('Could not find that user!');
           }
           else
           {
               var name = data[0]['username'];
               db.query("INSERT INTO user_group_rlshp VALUES ($1, $2, $3)", [name, group_id, 'member']).then(function()
               {
                   var new_post = "" + name + " is now part of group " + group_id;
                   db.query("INSERT INTO posts (group_id, username, post, time, visibility) VALUES ($1, $2, $3, $4, $5)", [group_id, req.session.username, new_post, new Date(), 'private']).then(function()
                   {
                        res.sendStatus(200);
                   }).catch(function(err)
                    {
                        res.status(403).send(err.message);
                    })
               }).then(function(err)
               {
                   res.status(403).send(err.message);
               });
           }
       }).catch(function(err)
       {
           res.status(403).send(err.message);
       });
   }
});


app.delete('/removeMember', function(req, res)
{
    debug.logRequest(req);

   var group_id = req.query.id;
   var username = req.body.username;

   if (group_id == undefined || username == undefined)
   {
       res.sendStatus(404);
   }
   else
   {
       if (req.session.role == "group_admin")
       {
           db.query("DELETE FROM user_group_rlshp WHERE username = $1 AND group_id = $2", [username, group_id]).then(function()
           {
               res.sendStatus(200);
           }).then(function(err)
           {
               res.status(403).send(err.message);
           });
       }
       else
       {
           res.status(403).send('You do not have sufficient privileges to do this action.');
       }
   }
});

app.post('/report', function(req, res)
{
    var group = req.query.id;
    var reason = req.body.report;

    db.query("INSERT INTO user_reports VALUES ($1, $2)", [group, reason]).then(function()
    {
        res.status(200).send('Thank you for sending your report. We will evaluate it and see if it is valid.');
    }).catch(function(err)
    {
        res.status(404).send('Could not send report.');
    });
});

module.exports = app;

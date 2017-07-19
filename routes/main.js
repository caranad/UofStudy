var express     = require('express');
var debug       = require('../utils/debug');

var app         = express.Router();

// -------------- HELPER ----------------------

function time_24hr(time, am_pm)
{
    if (am_pm == "am" && time < 12)
    {
        return parseInt(time);
    }
    else if (am_pm == "am" && time == 12)
    {
        return 0;
    }
    else if (am_pm == "pm" && time == 12)
    {
        return 12;
    }
    else
    {
        return parseInt(time) + 12;
    }
}

// -------------- HELPER ----------------------

/* GETs the home page on / if not logged in else redirects to news */
app.get('/', function(req, res)
{
    debug.logRequest(req);

    if (req.session.username == undefined) {
        res.sendFile(files_directory + 'index.html');
    } else {
        res.redirect('/news');
    }
});

/* POST to log in or register users. */
app.post('/', function(req, res)
{
    debug.logRequest(req);
    var username = req.body.username;
    var password = req.body.password;

    db.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]).then(function(data)
    {
        var items = data;
        if (items.length > 0)
        {
            if (items[0]['username'] == username && items[0]['password'] == password)
            {
                req.session.username = username;
                res.redirect('/news');
            }
        }
        else
        {
            res.redirect('/?error=1');
        }
    }).catch(function(err)
    {
        res.json(err);
    });
});

/* GETS the edit page if logged in. */
app.get('/edit', function(req, res)
{
    debug.logRequest(req);

    if (req.session.username !== undefined) {
        res.sendFile(files_directory + 'edit_profile.html');
    } else {
        res.redirect('/?error=1');
    }
});

/* Returns the news page after logging in */
app.get('/news', function(req, res)
{
    debug.logRequest(req);

    if (req.session.username !== undefined)
    {
        res.sendFile(files_directory + 'news_feed.html');
    }
    else
    {
        res.redirect('/?error=1');
    }
});

/* GET the register page used for registering users */
app.get('/register', function(req, res)
{
    debug.logRequest(req);

    res.sendFile(files_directory + 'register.html');
});

/* */
app.get('/registerGroup', function(req, res)
{
    debug.logRequest(req);
    if (req.session.username != undefined)
    {
        res.sendFile(files_directory + 'register_study_group.html');
    }
    else
    {
        res.redirect('/?error=1');
    }
});

/* */
app.get('/group', function(req, res)
{
    debug.logRequest(req);


    if (req.session.username != undefined)
    {
        var group_id = req.query.id;

        if (group_id == undefined)
        {
            res.sendStatus(404);
        }
        else
        {
            res.sendFile(files_directory + 'study_group.html');
        }
    }
    else
    {
        res.redirect('/?error=1');
    }
});

/* */
app.get('/updateGroup', function(req, res)
{
    debug.logRequest(req);

    if (req.session.username != undefined)
    {
        var group_id = req.query.id;

        if (group_id == undefined)
        {
            res.sendStatus(404);
        }
        else
        {
            res.sendFile(files_directory + 'edit_group.html');
        }
    }
    else
    {
        res.redirect('/?error=1');
    }

});

/* */
app.get('/basicsearch', function(req, res){
    debug.logRequest(req);

    // GET parameters for username, day (Mon - Fri), time (1 - 12) and AM/PM selector
    var name = req.query.keyword;
    var params = [];

    // Build the SQL query, based on whether or not group_name was initialized
    var query = "SELECT * FROM studygroups";

    if (name != undefined)
    {
        query = query + " WHERE group_name LIKE $1";
        var like_name = "%" + name + "%";
        params.push(like_name);
    }
    else
    {
        res.sendStatus(400);
    }

    db.query(query, params).then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.sendStatus(500);
    });
});

// Advanced search: search by location, day of meeting, tags
app.get('/advsearch', function(req, res)
{
    debug.logRequest(req);
    var name = req.query.courses;
    var location = req.query.location;
    var day = req.query.day;
    var tag = req.query.tag;
    var start_time = req.query.start_time;
    var end_time = req.query.end_time;
    var start_am_pm = req.query.start_am_pm;
    var end_am_pm = req.query.end_am_pm;

    var params = [];
    var i = 1;
    var found = false;

    // Query builder when multiple GET params are present
    var query = "SELECT distinct id, group_name, description, day FROM studyGroups INNER JOIN tags ON studygroups.group_name = tags.group_id ";

    // Search if name is in group name title
    if (name != undefined)
    {
        if (!found)
        {
            query += "WHERE";
            found = true;
        }

        query += " group_name LIKE $" + i;
        i++;
        params.push('%' + name + '%');
    }
    // Search location
    if (location != undefined)
    {
        if (!found)
        {
            query += " WHERE";
            found = true;
        }
        else
        {
            query += "AND";
        }

        query += " location LIKE $" + i;
        i++;
        params.push('%' + location + '%');
    }
    // Filter by date
    if (day != undefined)
    {
        if (!found)
        {
            query += " WHERE";
            found = true;
        }
        else
        {
            query += " AND";
        }

        query += " day = $" + i;
        params.push(day);
        i++;
    }
    // Filter by start time
    if (start_time != undefined)
    {
        if (!found)
        {
            query += " WHERE";
            found = true;
        }
        else
        {
            query += " AND";
        }

        query += " time >= $" + i;
        params.push(time_24hr(start_time, start_am_pm));
        i++;
    }
    // Filter by end time
    if (end_time != undefined)
    {
        if (!found)
        {
            query += " WHERE";
            found = true;
        }
        else
        {
            query += " AND";
        }

        query += " time < $" + i;
        params.push(time_24hr(end_time, end_am_pm));
        i++;
    }
    // Filter by tags used
    if (tag != undefined)
    {
        if (!found)
        {
            query += " WHERE";
            found = true;
        }
        else
        {
            query += "AND";
        }

        tag = tag.split(",");

        for (var x = 0; x < tag.length; x++)
        {
            query += " tag = $" + i;
            params.push(tag[x]);
            i++;

            if (x < tag.length - 1)
            {
                query += " OR ";
            }
        }
    }

    // Run the advanced search
    db.query(query, params).then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.sendStatus(500);
    });
});


/*
 * Logs the user out of their session and returns them
 * to the homepage.
 */
app.get('/logout', function(req, res)
{
    debug.logRequest(req);
    if (req.session.username !== undefined) {
        req.session.username = undefined;
        req.session.role = undefined;
        res.redirect('/');
    } else {
        res.sendStatus(403);
    }
});

module.exports = app;

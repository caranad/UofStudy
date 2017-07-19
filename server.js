var express     = require('express');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var pg          = require('pg');
var multer      = require('multer');
var pgp         = require('pg-promise')();

var app         = express();
var upload      = multer({ dest : __dirname +'/public/uploads'});

var PORT = process.env.PORT || 3000;

files_directory = __dirname + '/public/';

// Connect to PostgreSQL database
var connectionString = process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/uofstudy';
db = pgp(connectionString);
db.connect();

// declare Router middlewares
var main = require('./routes/main');
var users = require('./routes/users');
var study = require('./routes/study');
var posts = require('./routes/posts');
var comments = require('./routes/comments');

// Sessions, cookies, authentication libraries set up
app.use(express.static(files_directory));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(
    session({
        saveUninitialized: false,
        resave: false,
        secret: 'uofstudy'
    })
);

// Routes
app.use('/', main);
app.use('/users', users);
app.use('/studygroups', study);
app.use('/posts', posts);
app.use('/comments', comments);

app.listen(PORT, function(){
    console.log("Listening to port " + PORT);
});

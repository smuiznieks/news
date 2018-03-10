// Dependencies 
var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var logger = require('morgan');

var PORT = 7000;

// Require models to access collections
var db = require('./models');

// Initialize and configure Express
var app = express();
app.use(logger('dev')); 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes
app.get('/', function (req, res) {
    db.Headline.find().sort({createdAt: -1}).then(function(dbHeadlines) {
        hbsObject = { headline: dbHeadlines };
        res.render('home', hbsObject);
    }).catch(function(err) {
        res.json(err);
    });
});

app.get('/scrape', function(req, res) {
    request('http://time.com/', function(error, response, html) {
        var $ = cheerio.load(html);
        $('div.home-brief-title-and-excerpt').each(function(i, element) {
            var result = {};
            result.title = $(element).find('h2').text();
            result.link = $(element).find('h2').children().attr('href');
            result.summary = $(element).find('p.home-excerpt').text();
            db.Headline.create(result).then(function(dbHeadline) {
                res.json('Scrape complete.');
            }).catch(function(err) {
                return res.json('No new articles available.');
            });
        });
    });
});

app.get('/saved', function(req, res) {
    db.Headline.find({saved: true}).sort({savedAt: -1}).then(function(dbHeadlines) {
        hbsObject = { headline: dbHeadlines };
        res.render('saved', hbsObject);
    }).catch(function(err) {
        res.json(err);
    });
});

app.post('/saved/:id', function(req, res) {
    db.Headline.findOneAndUpdate({ _id: req.params.id}, { $set: { saved: true, savedAt: Date.now() }})
    .then(function(savedHeadline) {
        res.json(savedHeadline);
    }).catch(function(err) {
        res.json(err);
    });
});

app.post('/unsaved/:id', function(req, res) {
    db.Headline.findOneAndUpdate({ _id: req.params.id}, { $set: { saved: false }})
    .then(function(savedHeadline) {
        res.json(savedHeadline);
    }).catch(function(err) {
        res.json(err);
    });
});

app.get('/api/headline', function(req, res) {
    db.Headline.find({}).then(function(dbHeadlines) {
        res.json(dbHeadlines);
    }).catch(function(err) {
        res.json(err);
    });
});

app.get('/api/headline/:id', function(req, res) {
    db.Headline.findOne({ _id: req.params.id }).populate('note')
    .then(function(dbHeadline) {
        res.json(dbHeadline);
    }).catch(function(err) {
        res.json(err);
    });
});

app.post('/api/headline/:id', function(req, res) {
    db.Note.create(req.body).then(function(dbNote) {
        return db.Headline.update({ _id: req.params.id}, { $push: { note: dbNote._id }});
    }).then(function(dbHeadline) {
        res.json(dbHeadline);
    }).catch(function(err) {
        res.json(err);
    });
});

app.get('/api/note', function(req, res) {
    db.Note.find({}).then(function(dbNotes) {
        res.json(dbNotes);
    }).catch(function(err) {
        res.json(err);
    });
});

app.delete('/api/note/:id', function(req, res) {
    db.Note.findByIdAndRemove({ _id: req.params.id }).then(function(dbNote) {
        res.json(dbNote);
    }).catch(function(err) {
        res.json(err);
    });
});

// Listen
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});
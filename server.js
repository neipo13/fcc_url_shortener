const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoLocation = 'mongodb://fccShorurl:Freecodecamp98@ds147797.mlab.com:47797/urls';
const app = express(); 

app.get('/', function(req, res){
    //render html of directions
    res.send('home');
});

app.get('/new/:url', function(req, res){
    //validate url status
    console.log('in new');
    //generate Guid
    var d = new Date().getTime();
    var id = 'xxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    //create object to store in mongo
    var obj = {
        'id':id,
        'url':req.params.url
    };
    //store it in mongo
    mongo.connect(mongoLocation, function(err, db){
        //handle mongo errors
        if(err){
            console.log(err);
            res.send({ 'error':'Server Error'});
        }
        
        db
        .collection('urls')
        .insert(obj, function(err, data){
            //handle insert errors
            if(err){
                console.log('err in insert', err);
                res.send({ 'error':'Server Error'});
            }
            
            //return the url with the new Guid as id
            var url = {
                'short-url':'https://shorurl.herokuapp.com/' + id
            };
            res.send(url);
            db.close();
        });
    });
});

app.get('/:id', function(req, res){
    console.log('in redirect');
    //check if the id exists in mongo
    var id = req.params.id;
    mongo.connect(mongoLocation, function(err, db){
        if(err){
            console.log('err in insert', err);
            res.send({ 'error':'Server Error'});
        }
        
        var found = db
        .collection('urls')
        .find({'id':id})
        .toArray(function(error, docs){
            if(error){
                res.send('404');
            }
            if(typeof(docs) !== 'undefined' && docs !== null && docs.length > 0){
                //redirect to the page in question
                res.redirect('https://' + docs[0].url)
            }
            else{
                console.log('err in find',docs);
                
                res.send('404');
            }
            db.close();
        });
    });
    //otherwise render 404 page
});


app.listen(process.env.PORT || 8080, function(){
    console.log('listening on 8080');
});
/*
 * HTML to render for directions (apologize for heroku app name + non <5 character url before guid)
 * Importing monogo + putting it on heroku
 * is it brutally slow to check for the url before adding?
 * is it okay to have the Guid as id?
 * Guid generation in JS + eliminating 0O, 1lI, etc
 * Redirects in node
 */
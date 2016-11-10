const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoLocation = 'mongodb://fccShorurl:Freecodecamp98@ds147797.mlab.com:47797/urls';
const app = express(); 

//from stack overflow user ChristianD
//http://stackoverflow.com/a/15855457/2616265
function validateUrl(value){
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}

app.get('/', function(req, res){
    //render html of directions
    res.send('home');
});

app.get('/new/*', function(req, res){
    //validate url status
    var url = req.params[0];
    if(!validateUrl(url)){
        res.send({'short-url':'Invalid URL format - please format similar to "http://www.example.com"'});
        return;
    }
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
        'url':req.params[0]
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
    //console.log('in redirect');
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
                res.redirect(docs[0].url)
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
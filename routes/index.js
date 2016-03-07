var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var cookieParser = require('cookie-parser');
var path = require("path");
var fs = require("fs");
// function loadJSONfile (filename, encoding) {
//     try {
//         // default encoding is utf8
//         if (typeof (encoding) == 'undefined') encoding = 'utf8';
        
//         // read file synchroneously
//         var contents = fs.readFileSync(filename, encoding);

//         // parse contents as JSON
//         return JSON.parse(contents);
        
//     } catch (err) {
//         // an error occurred
//         throw err;  
//     }
// }
// var config = loadJSONfile(path.join(__dirname, '../..', '/turn/data/config.json'));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'City Guide' });
});
router.post('/send-options', function(req, res) {
    var data = {
        request: req.body,
        name: req.body.name,
        mail: req.body.mail,
        selected: JSON.parse(req.body.selected)
    };
    res.render('schedule', { name: data.name, selected: data.selected }, function(err, html){
        if (!data.name || !data.email) {
            res.send(true);
        } else {
            res.send(false);
        }
        //create the nodemailer
        var client = nodemailer.createTransport(sgTransport({
            auth: {
              api_key: process.env.TURN_SENDGRID_KEY

            }
        }));

        var mailOptions = {
            to: data.mail,
            from: 'sebastian@turninternational.co.uk',
            subject: data.name+": your itinerary courtesy from  \n ACCOR HOTELS",
            html: html
        };

        //send
        client.sendMail(mailOptions, function(err, info) {
            //re-render contact page with message
            var message = null;
            if(err){
                message = "An error has occured " + err;
                console.log(err);
            } else {
                message = "Email has been sent!";
                console.log('Message sent: ' + info.response);
            }
          });
	});
});
module.exports = router;
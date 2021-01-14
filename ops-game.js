'use strict'

const http = require('http'),
	    // https = require('https'),
	    express = require('express'),
	    // formidable = require('formidable'),
			helmet = require('helmet'),
	    fs = require('fs'),
	    vhost = require('vhost'),
			nodemailer = require('nodemailer'),
			bodyParser = require('body-parser'),
      app = express(),
			router = express.Router();




// disabling the header
app.use(helmet.hidePoweredBy());
app.disable('x-powered-by');

// Sets "X-XSS-Protection: 0"
// app.use(helmet.xssFilter());




// set up handlebars view engine
const handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: (name, options)=> {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);



// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    const domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            const worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(error){
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});



// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
      break;
    case 'production':
      // module 'express-logger' supports daily log rotation
      app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
    break;
}

const mailTransport = nodemailer.createTransport({
 host: 'smtp.gmail.com',
 secureConnection: true, // используйте SSL
 port: 465,
 auth: {
	 /* data of the email address you want to send messages from
	    ATTENTION!!!
			allow account access for less secure apps, without this option, the letter will not come to the sent address.
			if you don't send emails from the local host, try sending them from the global host.
		*/
   user: "******",  // email name
   pass: "******", // email password
 }
});
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(bodyParser.json());


app.post('/process', urlencodedParser, function(req, res){
	const bodyI = JSON.stringify(req.body);
	mailTransport.sendMail({
	 from: '"Mobiliz" <******>', // the email address that the message came from
	 to: '******', // the email address that the message was sent to
	 subject: 'Request from the form. Please do not respond to this message',
	 text: `${bodyI}`
	}, (error)=> {
	 if(error) console.error( 'Unable to send email: ' + error );
	});

 if(req.xhr || req.accepts('json,html' )==='json' ){
 res.send({ success: true });
 } else {

// res.redirect( console.log('thank-you'));
// res.render('/thank-you', );

 }
});


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=> {
	res.render('home');
});


// 404 catch-all handler (middleware)
app.use((req, res, next)=> {
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use((err, req, res, next)=> {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});


let server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), ()=> {
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}

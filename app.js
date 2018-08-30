//start mongoDB
//"C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"

const express = require('express');
const ejs = require('ejs');
const oauthRoutes = require('./routes/oauth-routes');
const uploadRoutes = require('./routes/upload-routes');
const profileRoutes = require('./routes/profile-routes');
const quoteRoutes = require('./routes/quote-routes');
const usersRoutes = require('./routes/users-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const Quote = require('./models/quote-model');
const User = require('./models/user-model');
const flash = require('connect-flash');

// mongoose.connect('mongodb://localhost/quote');
mongoose.connect('mongodb://nikt:randompassword1@ds211592.mlab.com:11592/quote')

const app = express();

//cookies
app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [keys.cookies.key]
}))

//initialize passport
app.use(passport.initialize());
app.use(passport.session())


//set view engine
app.set('view engine', 'ejs');

//static files
app.use(express.static('./assets/'));
//for serving static images
app.use('/assets/uploadedImages', express.static('./assets/uploadedImages'));

//flash messages
app.use(flash());

app.use('/auth', oauthRoutes);
app.use('/upload', uploadRoutes);
app.use('/profile', profileRoutes);
app.use('/quote', quoteRoutes);
app.use('/users', usersRoutes)

//home page route
app.get('/', function(req, res){
	//get one random quote
	Quote.count().then(function(count){ //find number of documents in Quotes
		var random = Math.floor(Math.random() * count);  //get a random number between 0 and the number of documents in Quotes
		Quote.findOne().skip(random).then(function(randomQuote){  //retrive te random quote 
			User.findOne({_id: randomQuote.userId}).then(function(user){ //find person who submitted this random quote
				res.render('index.ejs', {user: req.user, quote: randomQuote, author: user}) //author is the person who posted this quote
			})
		})
	})
})


app.listen(3000, function(){
	console.log('listening on port 3000')
});


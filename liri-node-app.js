var inquirer = require('inquirer');
var omdb = require('request');
var keys = require('./keys.js');
var spotifyKeys = require('./spotifyKeys')
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require('fs');


function startIt(argv){
	if (argv === 'do-what-it-says'){
		readToDecide();
	} else {
		inquirer.prompt([ 
			{
				type: 'list',
				message: 'Choose one of the following:',
				choices: ['my-tweets', 'spotify-this-song', 'movie-this'],
				name: 'choice'
			}
			]).then(function(inquireResponse) {
				var choice = inquireResponse.choice;
				console.log('You chose \"' + choice + '\".');
				var logText = userInput(choice);
				logIt(logText);
				switchIt(choice);
			}
		);
	}
}
// end of startIt


function userInput(choice){
	var today = new Date();
	var logText = '\n\nUser input: \"' + choice + '\" on ' + today.toDateString() + ' at ' + today.toTimeString() + '...\n';
	return(logText);
}

function readToDecide(){
	fs.readFile('./random.txt', 'utf8', function(err, data){
		if(!err){
			var argChoice = 'do-what-it-says'
			var logText = userInput(argChoice);
			logIt(logText);
			var randomArr = data.split(',');
			var choice = randomArr[0];
			var title = randomArr[1].slice(1, -1);
			switchIt(choice, title);
		} else {
			logIt('UGH...' + err);
			console.log('UGH...' + err);
		}
	});
}
// end of readToDecide


function switchIt (choice, title){
	switch(choice){
		case 'my-tweets':
		if(!title){
		choseTweets();
		} else {
			getTweets(title);
		} 
		break;

		case 'spotify-this-song':
		if(!title){
		choseSpotify();
		} else {
			getSpotifyData(title);
		}
		break;

		case 'movie-this':
		if(!title){
		choseMovie();
		} else {
			getOmdbData(title);
		}
		break;
	}
}
// end of switchIt


function choseTweets (){
	inquirer.prompt([ 
	{
		type: 'input',
		message: 'What is your Twitter id?',
		name: 'tweetId'
	}
	]).then(function(inquireResponse) {
		var tweetId = inquireResponse.tweetId;
		if (tweetId){
			getTweets(tweetId);
		}else{
			// tweetId = '@HoraceWalstrom';
			getTweets('@HoraceWalstrom');
		}
	});
}
// end of choseTweets


function choseSpotify (){
	inquirer.prompt([ 
	{
		type: 'input',
		message: 'Which song do you want?',
		name: 'song'
	}
	]).then(function(inquireResponse) {
		var song = inquireResponse.song;
		if(song){
			getSpotifyData(song);
		}else {
			// song = 'The Sign by Ace of Base';
			getSpotifyData('The Sign by Ace of Base');
		}
	});
}
// end of chose Spotify


function choseMovie(){ 
	inquirer.prompt([ 
	{
		type: 'input',
		message: 'Which movie do you want?',
		name: 'movie'
	}
	]).then(function(inquireResponse) {
		var movie = inquireResponse.movie;
		if(movie){
			getOmdbData(movie);
		}else{
			// movie = 'Mr. Nobody';
			getOmdbData('Mr. Nobody');
		}
	});
}
// end of choseMovie


function getTweets (tweetId) {
	var client = new Twitter(
	{
		consumer_key: keys.consumer_key,
		consumer_secret: keys.consumer_secret,
		access_token_key: keys.access_token_key,
	 	access_token_secret: keys.access_token_secret
	 });
	var params = {screen_name: tweetId};
	client.get('statuses/user_timeline', params, function(err, tweets, response) {
		if (!err) {
			var tweetText = '\n\nLast Twenty Tweets for ' + tweetId + ':\n\n\n\n';
			for (var i = 0; i < tweets.length; i++) {
				tweetText = tweetText + ' Tweet Number: ' + (i + 1) + '\n';
                tweetText = tweetText + '**************************************************************\n\n';
                tweetText = tweetText + ' Created: ' + tweets[i].created_at + '\n\n';
                tweetText = tweetText + ' Tweet: ' + tweets[i].text + '\n\n';
                tweetText = tweetText + '**************************************************************\n\n\n';
            }
            console.log(tweetText);
            logIt(tweetText);
		} else {
			logIt('UGH...' + err + '\n\n\n')
			return console.log('UGH...' + err);
		}
	});
}
//end of getTweets


function getSpotifyData (song) {
	var spotify = new Spotify({
		id: spotifyKeys.id,
		secret: spotifyKeys.secret
	});
	spotify.search({type: 'track', query: song}, function(err, data) {
		if (!err) {
			var spotText = '\n\nSong Information:\n';
            spotText = spotText + '**************************************************************\n';
            spotText = spotText + 'Artist(s): ' + data.tracks.items[0].album.artists[0].name + '\n';
            spotText = spotText + 'Title: ' + data.tracks.items[0].name + '\n';
            spotText = spotText + 'Preview: ' + data.tracks.items[0].preview_url + '\n';
            spotText = spotText + 'Album: ' + data.tracks.items[0].album.name + '\n';
            spotText = spotText + '**************************************************************\n\n';
            console.log(spotText);
            logIt(spotText);
		} else {
			logIt('UGH...' + err + '\n\n\n')
			return console.log('UGH...' + err);
		}
	});
}
// end of getSpotify



function getOmdbData(movie) {
	omdb("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&r=json&tomatoes=true&apikey=40e9cece", function (err, response, body) {
		if (!err && response.statusCode == 200) {
			var movieData = JSON.parse(body);
			if(movieData.Title === undefined){
				var noGoodText = 'Your choice was no good.  Give up or try again.  It\'s up to you.';
				logIt(noGoodText);
				return console.log(noGoodText);
			}
			var movieText = '\n\nMovie Information\n';
            movieText = movieText + '**************************************************************\n';
			movieText = movieText + 'Movie Title: ' + movieData.Title + '\n';
			movieText = movieText + 'Year Released: ' + movieData.Released + '\n';
			movieText = movieText + 'IMBD Rating: ' + movieData.imdbRating + '\n';
			movieText = movieText + 'Rotten Tomatoes Rating: ' + movieData.tomatoRating + '\n';
			movieText = movieText + 'Country: ' + movieData.Country + '\n';
			movieText = movieText + 'Language: ' + movieData.Language + '\n';
			movieText = movieText + 'Plot: ' + movieData.Plot + '\n';
			movieText = movieText + 'Actors: ' + movieData.Actors + '\n';
            movieText = movieText + '**************************************************************\n\n';
            console.log(movieText);
            logIt(movieText);
		} else {
			logIt('UGH...Youah breakum mah code...' + err + '\n\n\n')
			console.log('UGH...Youah breakum mah code...' + err);
			return;
		}
	});
}
// end of getOmdbData


function logIt(logText){
	fs.appendFile('./log.txt', logText, function(err) {
		if (err) {
			console.log('The log file was not appended: ' + err);
		}
		else {
			return;
		}
	});
}
// end of logIt


// liri app
startIt(process.argv[2]);



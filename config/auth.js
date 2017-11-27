var local = process.env.LOCAL;

// sets the env vars for twitter auth depending if on heroku or local
if (local) {
    console.log("local config");
    module.exports = {
        twitterAuth: {
            consumerKey: process.env.TWITTER_TODO_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_TODO_CONSUMER_SECRET,
            callbackUrl: 'http://127.0.0.1:3000/auth/twitter/callback'
        }
    }
} else {
    console.log("remote config");
    module.exports = {
        twitterAuth: {
            consumerKey: process.env.TWITTER_TODO_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_TODO_CONSUMER_SECRET,
            callbackUrl: 'https://mighty-fjord-76860.herokuapp.com/auth/twitter/callback'
        }
    }
}
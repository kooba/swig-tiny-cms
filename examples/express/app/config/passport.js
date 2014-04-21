
var LocalStrategy = require('passport-local').Strategy
var User =  { id: '1234567', isAdmin: true, email: 'admin@admin.com' }

module.exports = function (passport) {

  // serialize sessions
  passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user.id)
  });

  passport.deserializeUser(function(id, done) {
    console.log(id);
    done(null, User);
  });

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
        console.log(email);
        if(email === 'admin@admin.com')
          return done(null, User);
        else
          return done(null, false, { message: 'Unknown user' });
    }
  ));
}

var LocalStrategy = require('passport-local').Strategy;
var User =  { id: '1234567', roles: ['Admin'], email: 'admin@admin.com', name: 'Joe Smith' };

module.exports = function (passport, app) {

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  });

  passport.deserializeUser(function(id, done) {
    //Normally lookup user from database.
    //Here we are returning dummy user.
    done(null, User);
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
        if(email === 'admin@admin.com' && password === 'password')
          return done(null, User);
        else
          return done(null, false, { message: 'Unknown user' });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
};

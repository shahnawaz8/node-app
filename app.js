const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

app.use(session({
  secret: 'getyolo',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const users = [
  { id: 1, username: 'mrlucky', password: '1234' },
];

passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user || user.password !== password) {
      return done(null, false);
    }
    return done(null, user);
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // session time 15 min
  max: 5, //per ip
});

app.use(limiter);

// Interceptor middleware
app.use((req, res, next) => {
  console.log(`request ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('working')
});

app.get('/login', (req, res) => {
  res.send('Please log in.');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Welcome to the dashboard, ' + req.user.username + '!');
  } else {
    res.redirect('/login');
  }
});
//for cicd
// app.get('/github-ci-cd', (req, res) => {
//   res.send('GitHub CI/CD: Deployment Successful!');
// });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { serializeUser, deserializeUser } = require('passport');
const passportLocal = require('passport-local').Strategy;
const mysql = require('mysql');
const request = require('request');

const apiKey = '35d760f3a0f94b1c87473893a9edfcbf';
const apiUrl = 'https://newsapi.org/v2/everything?q=tesla&from=2022-08-16&sortBy=publishedAt&apiKey=' + apiKey;
const app = express();

//Conexion con la bd
const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'prueba',
    user: 'sqluser',
    password: 'password'
});


app.use(express.urlencoded({extended: true}));
app.use(cookieParser('secreto'));
app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(function(username, password, done){
    let nombre = 'SELECT * FROM cuentas WHERE username = ? AND password = ?';
    let query = mysql.format(nombre, [username, password]);
    conexion.query(query, function(err, result){
        if (err) 
            throw err;
            
        return done(null, result[0]);
    });
}));

//serialize
passport.serializeUser(function(user, done){
    done(null, user.id);
});

//deserialize
passport.deserializeUser(function(id, done){
    done(null, { id: 1, username: 'Deiby', password: '1234' });
});

app.set('view engine', 'ejs');

app.set('port', 8080);

app.get("/home",  (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
},(req, res)=>{
    res.render("home");
}, function(req, res) {

});

app.get("/login",(req, res)=>{
    res.render("login");
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/home",
    failureRedirect: "/login"
}));

app.listen(app.get('port'), ()=> console.log("Server started on port: ", app.get('port')));
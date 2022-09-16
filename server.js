const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { serializeUser, deserializeUser } = require('passport');
const passportLocal = require('passport-local').Strategy;

const app = express();

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
    if(username === "Deiby" && password === "Deiby")
        return done(null, {id: 1, name: "Deiby"});

    done(null, false);
}));

//serialize
passport.serializeUser(function(user, done){
    done(null, user.id);
});

//deserialize
passport.deserializeUser(function(id, done){
    done(null, {id: 1, name: "Deiby"});
});

app.set('view engine', 'ejs');

app.get("/",  (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
},(req, res)=>{
    //si ya iniciamos sesión mostrar las noticias

    //si no hemos iniciado sesión redireccionar a /login
    res.send("Hola");
});

app.get("/login",(req, res)=>{
    //mostrar el formulario
    res.render("login");
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login"
}));

app.listen(8080, ()=> console.log("Server started"));
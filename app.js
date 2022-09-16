const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { serializeUser, deserializeUser } = require('passport');
const passportLocal = require('passport-local').Strategy;
const mysql = require('mysql');
const request = require('request');

const https = require("https");
const { dirname } = require('path');
const apiKey = "969f8f5a1a5c82ef6f8dcac06259a549";
const locations = "Colombia";
const api = "https://api.openweathermap.org/data/2.5/weather?q="+locations+"&appid="+apiKey;

var my_api_key = "888e1bae53f6445c8c7a762df5510430";
var api_url = "https://newsapi.org/v2/everything?q=microsoft&from=2021-08-17&sortBy=publishedAt&apiKey="+my_api_key;

const app = express();

//Conexion con la bd
const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'prueba',
    user: 'sqluser',
    password: 'password'
});

app.use(express.static('public'));  
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
});

app.get("/weather", (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
}, function(req, res) {
    https.get(api, function(response){
        response.on("data", function(data){
            const weatherData = JSON.parse(data);
            const temperature = weatherData.main.temp;
            const tempmin = weatherData.main.temp_min;
            const tempmax = weatherData.main.temp_max;
            const presion = weatherData.main.pressure;
            const humedad = weatherData.main.humidity;
            const hora = weatherData.main.timezone;
            res.write("<p> La temperatura en "+locations+" es: <b>"+ temperature +"</b></p>"+
                      "<p> \n La temperatura Minima en "+locations+" es: <b>"+ tempmin +"</b></p>" +
                      "<p> \n La temperatura Maxima en "+locations+" es: <b>"+ tempmax +"</b></p>" +
                      "<p> \n La presion en "+locations+" es: <b>"+ presion +"</b></p>"+
                      "<p> \n La humedad en "+locations+" es: <b>"+ humedad +"</b></p>" +
                      "<p> \n Los zona horaria en "+locations+" es: <b>"+ hora +"</b></p>" );
            res.send()
        });
    });
});

app.get("/news", (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
}, function(expReq, expRes){

	request({
		uri: api_url,
		method: 'GET'
	},
	  function(err,res,body){
	  	console.log(body);
	  	var data = JSON.parse(body);

	  		var finalResponse = `<style>
	  							 table thead th{
	  							 	background-color: #a7d6fc;
	  							 	color: #020801;
	  							 }
	  							 </style>
	  							 <table>
	  							 <thead>
	  							 <th>
	  							 Thumbnail
	  							 </th>
	  							 <th>
	  							 Title
	  							 </th>
	  							 <th>
	  							 Description
	  							 </th>
	  							 <th>
	  							 News URL
	  							 </th>
	  							 <th>
	  							 Author
	  							 </th>
	  							 <th>
	  							 publishedAt
	  							 </th>
	  							 <th>
	  							 Contant
	  							 </th>
								 </thead><tbody>`;

								 data = data.articles;

								 for (var rec in data ) {
								 	finalResponse += `
								 					 <tr>
								 					 <td>
								 					 <img src="${data[rec].urlToImage}" style="width:200px;" />
								 					 </td>
								 					 <td>
								 					 ${data[rec].title}
								 					 </td>
								 					 <td>
								 					 ${data[rec].description}
								 					 </td>
								 					 <td>
								 					 <a href="${data[rec].url}" target="_blank">${data[rec].url}</a>
								 					 </td>
								 					 <td>
								 					 ${data[rec].author}
								 					 </td>
								 					 <td>
								 					 ${data[rec].publishedAt}
								 					 </td>
								 					 <td>
								 					 ${data[rec].content}
								 					 </td>
								 					 </tr>`;
								 					 
 								 }

 								 finalResponse += `</tbody></table></body></html>`;
 								 expRes.send(finalResponse);
 								});

});

app.get("/login",(req, res)=>{
    res.render("login");
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/home",
    failureRedirect: "/login"
}));

app.listen(app.get('port'), ()=> console.log("Server started on port: ", app.get('port')));
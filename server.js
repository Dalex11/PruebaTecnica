const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get("/",(req, res)=>{
    //si ya iniciamos sesión mostrar las noticias

    //si no hemos iniciado sesión redireccionar a /login
});

app.get("/login",(req, res)=>{
    //mostrar el formulario
    res.render("login");
});

app.post("/login",(req, res)=>{
    //recibir credenciales e iniciar sesión
});

app.listen(8080, ()=> console.log("Server started"));
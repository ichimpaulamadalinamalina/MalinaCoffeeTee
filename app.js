const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const fs=require('fs')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

const port = 6789;
var sess;
/*
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true, path: '/'}
  }));
  */
app.use(session({secret:'shh', saveUninitialized:false}));
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

//app.get('/', (req, res) => res.render('index.ejs'));

var validator = require('validator');

validator.isEmail('malinaichim940@gmail.com'); //=> true

const joi = require('joi');
  try {
    const schema = joi.object().keys({
      utilizator: joi.string().min(3).max(45).required(),
      parola: joi.string().min(6).max(20).required()
    });

    const dataToValidate = {
        utilizator: "malina",
        parola: "malina",
    }
    const result = schema.validate(dataToValidate);
    if (result.error) {
      throw result.error.details[0].message;
    }    
  } catch (e) {
      console.log(e);
  }
  


var mysql = require('mysql');
var o={
	host: "localhost",
	user: "malina",
	password: "malina",
	insecureAuth:true,
	database:'cumparaturi',
  };



app.get('/', (req, res) => {
	sess = req.session;
	sess.username; 
	console.log("ses"+sess.username);
	var con = mysql.createConnection(o);
	con.connect(function(err,db){
		
		if(err)
		{
			console.log(err);
		}
		else{
			
				var sql = "SELECT * FROM produse";
  			    con.query(sql, function (err,data,fields) {
    		    if (err) throw err;
				sess.id=data;
				console.log(data);
              
			res.render('index',{eroare:req.cookies.mesajEroare,user:sess.username, cookie: req.cookies.utilizator,items:data});	
		
	     });
		}
			});
			
	
	
	//res.render('index',{eroare:req.cookies.mesajEroare,user:sess.username, cookie: req.cookies.utilizator,items:data});
	
});
//app.get('/', (req, res) => res.render('index.ejs'));
app.get('/chestionar', (req, res) => {
	sess = req.session;
	sess.username; 
	fs.readFile("intrebari.json",(err,data)=>{
		if(err)
		{
			console.log(err);
		}
		const listaIntrebari = JSON.parse(data);
		res.render('chestionar', {eroare:req.cookies.mesajEroare,user:sess.username,intrebari: listaIntrebari});
		
	});
	
});
app.post('/rezultat-chestionar', (req, res) => {
	sess = req.session;
	var raspunsuriInput =req.body;
	console.log(raspunsuriInput);
	var count=0;
	fs.readFile("intrebari.json",(err,data)=>{
		if(err)
		{
			console.log(err);
		}
		const listaIntrebari = JSON.parse(data);
		for(var i=0;i<listaIntrebari.length;i++)
		{
			if(raspunsuriInput["q"+i] === listaIntrebari[i].variante[listaIntrebari[i].corect])
			{
				count+=1;
			}
		}
		res.render('rezultat-chestionar',{eroare:req.cookies.mesajEroare,user:sess.username,raspuns:count});
		
	});
	
});
//app.get('/autentificare', (req, res) => res.render('autentificare.ejs'));	
app.get('/autentificare',(req,res)=>{
	sess = req.session;
	res.render('autentificare',{eroare:req.cookies.mesajEroare, utilLogat:sess.username});
});	
app.post('/verificare-autentificare', (req, res) => {
	console.log("aici");
	sess = req.session;
	
	
	fs.readFile("utilizatori.json",(err,data)=>{
		console.log("aiciq");
		if(err)
		{
			console.log(err);
		}
		const listaUtilizatori = JSON.parse(data);
		console.log(listaUtilizatori);
		const nume1 = req.body.username;
	    const parola1 = req.body.pass;
		sess = req.session;
		var ok=0;
		var k;
	    for(var i=0;i<listaUtilizatori.length;i++)
		{
		  if(listaUtilizatori[i].nume==nume1 && listaUtilizatori[i].parola==parola1)
		  {
			  ok=1;
			  console.log( "1"+ok);
			  k=i;
		  }
		  if (nume1 == 'admin' && parola1 == 'admin') {
			 console.log( "nu stiu sa activez un button");
		     sess.username = 'admin';
			 ok=3;
             res.cookie('utilizator', sess.username);
             res.redirect(302,'/admin');
             res.end();
			 return;
          
          }

		}
			if(ok==1)
			{
				sess.username = listaUtilizatori[k].utilizator;
				sess.numeUtilizator = listaUtilizatori[k].nume;
				sess.prenume = listaUtilizatori[k].prenume;
				console.log("2"+sess);
				console.log("3"+sess.username);
				res.cookie("utilizator",req.body.username,{expires:new Date(Date.now()+ 9000)});
		
				res.redirect(302,'http://localhost:6789/');
		
				res.end();
			}
			else if(ok==0)
			{
				res.cookie("mesajEroare","Date incorecte",{expires:new Date(Date.now()+ 9000)});
		
			    res.redirect(302,'http://localhost:6789/autentificare');
		
			    res.end();
			}
	
		
		
     });
		
});
	

app.get('/logout',(req,res)=>{

	res.cookie("utilizator","",{expires: new Date(Date.now()+1)});
	req.session.username = undefined;
	res.redirect(302,"/");
});


var prod = [];
app.post('/adaugare-cos',(req,res)=>{
	
	prod.push(req.body.id);
	console.log(req.body.id);
	sesiune=req.session;
	sesiune.produse = prod;
	console.log(prod);
});


app.get('/vizualizare_cos',(req,res)=>{
	sess = req.session;
	res.render('vizualizare_cos',{eroare:req.cookies.mesajEroare, utilLogat:sess.username,produse:prod});
});
	
	
app.get('/admin',(req,res)=>{
	sess = req.session;
	res.locals.esteadmin=(sess.username=="admin");
    res.render('admin');
});

app.post('/admin-adaugare',(req,res)=>{
	sess = req.session;
	console.log(req.body.name);
	var con = mysql.createConnection(o);
	con.connect( function(err,db){
	console.log('INSERT INTO produse (name, price) VALUES (?, ?)', [req.body.name,req.body.price]);
	console.log(req.body.name);
	con.query('INSERT INTO produse (name, price) VALUES (?, ?)', [req.body.name,req.body.price], function(err,result) {
		if(err) throw err
		console.log("Number of records inserted: " + result.affectedRows);
	})	
	//res.locals.esteadmin=(sess.username=="admin");
    res.redirect(302,'http://localhost:6789/');
		
	res.end();

});
	
		
});
app.get('/creare-bd',(req,res)=>{
	var con = mysql.createConnection(o);
	con.connect( function(err,db){

		if(err)
		{
			console.log(err);
		}
		else{
		
			//con.query("CREATE DATABASE IF NOT EXISTS cumparaturi", function (err, result) {
			//  if (err) throw err;
			//	  console.log("Database created");
			//	});

  			 var sql = "CREATE TABLE IF NOT EXISTS produse(name VARCHAR(255), price VARCHAR(255))";
  			 con.query(sql, function (err, result) {
    		 if (err) throw err;
    		 console.log("Table created");
        });	 
	}
  
	});

	res.redirect("/");
});


app.get('/inserare-bd',(req,res)=>{
	var con = mysql.createConnection(o);
	con.connect( function(err,db){

		if(err)
		{
			console.log(err);
		}
		else{
			
			var sql = "INSERT INTO produse (name, price) VALUES ?";
			var values = [
			  ['Cafea neagră', '6'],
			  ['Expresso', ' 4'],
			  ['Ceai verde', '5'],
			  ['Ceai de mentă', '4'],
			  ['Cafea scurtă', '5'],
			  ['Cafea lungă', '5'],
			  ['Cappucino', '4'],
			  ['Latte Machiato', '7'],
			  
			];
			con.query(sql, [values], function (err, result) {
				if (err) throw err;
				console.log("Number of records inserted: " + result.affectedRows);
			});
  
		}
		
	});
	res.redirect("/");
});


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));


/*****************************************************************/
/*****************************************************************/
/******************                          *********************/
/******************   PROJECT RN SQLITE API  *********************/
/******************                          *********************/
/*****************************************************************/
/*****************************************************************/




/*************************************************************************************/
/****************** USING EXPRESS and CORS FOR MAKING THINGS SIMPLER **************************/
/*************************************************************************************/
/*eslint-disable no-unused-params */
var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors());
app.options('*', cors()); // include before other routes


/*************************************************************************************/
/******************* CONVERTING RETURNED DATA TO JSON ********************************/
/*************************************************************************************/
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
//end of converting returned data to json


/*************************************************************************************/
/*************************** MYSQL HANDLING CODE *************************************/
/*************************************************************************************/

// Require process, so we can mock environment variables
const process = require('process');
const mysql = require('mysql');
const aes256 = require('aes256');
const config = require('./config');
// const password = aes256.decrypt(typeof x, config.password);
const password = config.password;

const con = mysql.createConnection({
	connectionLimit: 100, //important
	host: config.host, //process.env.SQL_CONNECTION_NAME,
	user: config.user, //process.env.SQL_USER,
	password: password, //process.env.SQL_PASSWORD,
	database: config.database, //process.env.SQL_DATABASE,
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  // FMD - https://www.w3schools.com/nodejs/nodejs_mysql.asp

  /*  Database creation  */
  // con.query("CREATE DATABASE mydb", function (err, result) {
  //   if (err) throw err;
  //   console.log("Database created");
  // });

  /*  Table creation  */
  // var sql = "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))";
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("Table created");

});

function sendResponseNormal(rows, res) {
	res.json(rows);
}


/**************************************************************************************/
/*********                     WEB APPLICATION API CALLS              *****************/
/**************************************************************************************/

//get node id (client's connected to this API will use this node id)
app.get('/node_details', function (req, res) {
	var projectName = config.project_name;
	var deploymentType = config.deployment_type;
	if (deploymentType)
		res.json({ "project_name": projectName, "deployment_type": deploymentType, "responseStatus": responseStatus });
	else
		res.json({ "error": "Something went wrong while fetching the node id. Please contact admin." });
});

var request = require('request');
var responseStatus = "true";

// setInterval(function () {
// 	initiator();
// }, 3600000);

// Inserting items
app.post('/insertItems', function (req, res) {
	var items = req.body.value;
	console.log("Received items = " + items);
	console.log(typeof(items));
	items = Object.values(items);
	items = items.forEach(item => {
		return item;
	});
	console.log(items);

	itemsArray = items.split(",");
	console.log(itemsArray);

	// var sample = [['aa'], ['bb']];
	// console.log(sample);

  	var sql = `INSERT INTO items (value) VALUES ?`;
	con.query(sql, [itemsArray], function (err, result, fields) {
		console.log("From /insertItem");
	    if (err) console.log(err);
	    console.log("Item Inserted - "+ items);
	    res.send(result);
	});

	// console.log("done -> " + done);
	// console.log("value -> " + value);

	// res.send({hasError: false, canInsert: true});
});



// Inserting items
app.post('/insertItem', function (req, res) {
	var item = req.body.value;

  	var sql = `INSERT INTO items (value) VALUES ('${item}')`;
	con.query(sql, function (err, result, fields) {
		console.log("From /insertItem");
	    if (err) console.log(err);
	    console.log("Item Inserted - "+ item);
	    res.send(result);
	});
});

// Fetching items
app.get('/getItems', function (req, res) {
  	var sql = `SELECT * FROM items ORDER BY id DESC`;
	con.query(sql, function (err, result, fields) {
	    if (err) console.log(err);
	    res.send(result);
	});
});


app.listen(8080);





















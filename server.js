// your code goes here
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const path = require('path');
const http = require('http');
const cors = require('cors');
var app = express();

//  home page
app.get('/', (req, res) => {

  res.sendFile(__dirname + '/index.html');
});

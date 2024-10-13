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
const PORT = process.env.PORT || 7000;

app.use(cors());

app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser());

app.use(express.static('Static'));


// AFTER ESTABLISHING THE MODULES AND THE APP, START THE DATABASE
var mysqlConnection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'GardenStateOnABudget',
multipleStatement: true
});

mysqlConnection.connect((err)=> {
if (!err)
console.log('Connection successfully');
else
console.log('connection failed');
});

// USE PORT 7000
const port = 7000;
app.listen(port, ()=> console.log('listening on port 7000...'));
const JWT_SECRET = 'your_jwt_secret';
const jwtKey = 'my_secret_key'
const jwtExpirySeconds = 300;


//  home page
app.get('/', (req, res) => {

  res.sendFile(__dirname + '/index.html');
});
app.get('/dashboard', (req, res) => {
   // res.status(200).send({ message: 'This is secure data.' });

  res.sendFile(__dirname + '/dashboard.html');
});





// User Registration
// User Registration
app.post('/register', (req, res) => {
    //console.log(req.body); // Log the entire request body for debugging
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.pwd;

    // Check for required fields
    if (username.length === 0 || username.length > 50 || !email || !password) {
let html = `<script>
alert("Invalid field values.");
window.location.href = "/";
</script>`;
        res.send(html);
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    // Use parameterized query to prevent SQL injection
    const query = `INSERT INTO users (username, email, pwd) VALUES (?, ?, ?)`;
    
    mysqlConnection.query(query, [username, email, hashedPassword], function(err, result) {
        if (err) {
let html = `<script>
alert("User registration failed.  Error: ${err.message}");
window.location.href = "/";

</script>`;
        res.send(html);
        }
    res.send("<script>alert('User Registration Successful.  Please login.'); window.location.href = '/';</script>");

    });
});

app.post('/login', (req, res) => {
    //console.log(req.body); // Print the request body to the console

    const email = req.body.loginEmail; // Get email from request body
    const password = req.body.loginPwd; // Get password from request body
	let user;
if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
}

    let token = req.cookies.token;
    //console.log(token);
    if (token){
        //console.log('before:' + token);
        res.clearCookie('token');
        console.log('after:' + token);
        //res.send("<script>window.location.href = './'</script>");	 
    
    }
    //var bcrypt = require('bcryptjs');
    mysqlConnection.query('select * from Users where email = ?', [email], (err, rows, fields) => {
        if (err) {
            console.error('Error while performing Query.', err);
            return res.status(500).send('Internal Server Error');
        }

        // If no user is found with the provided email
        if (rows.length === 0) {
            console.log('Email not found');
            return res.send("<script>alert('Wrong credentials, try again.'); window.location.href = '/';</script>");
        }

        
    });
});


app.post('/plants', (req, res) => {
    const sql = 'SELECT * FROM Plants';

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).send('Internal Server Error');
        }

else{

    const lightValues = results.map(plant => plant.light);

    // Use Set to extract unique 'light' values
    const uniqueLightValues = [...new Set(lightValues)];

const soil_moisture = results.map(plant => plant.soil_moisture);

    // Use Set to extract unique 'light' values
    const uniqueSoilValues = [...new Set(soil_moisture)];
const habit = results.map(plant => plant.habit);

    // Use Set to extract unique 'light' values
    const uniqueHabitValues = [...new Set(habit)];

const duration = results.map(plant => plant.duration);

    // Use Set to extract unique 'light' values
    const uniqueDurationValues = [...new Set(duration)];

let html = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Garden State On a Budget</title>
                            <link rel="stylesheet" href="style.css">
                        </head>
                        <body>
                            <header>
                                <nav>
                                    <ul>
                                        <li><a href='/dashboard'>Dashboard</a></li>
                                        <li>
                                            <form action="/logout" method="post">
                                                <button type="submit">Logout</button>
                                            </form>
                                        </li>
                                    </ul>
                                </nav>
                            </header>
                            <main>
    <div class="container">
        <h1>Smart Plant Recommender</h1>
        <!-- Light Input -->
        <label for="lightInput">Select Light Condition:</label>
        <select id="lightInput" name = "lightInput">
            <option value="">--Select Light Condition--</option>`;
uniqueLightValues.forEach(val => {
html += `<option value=${val}>${val}</option>`;
});
html += `</select>
        <label for="soilInput">Select Soil Moisture:</label>
        <select id="soilInput" name = "soilInput">
        <option value="">--Select Soil Type--</option>`;

uniqueSoilValues.forEach(val => {
html += `<option value=${val}>${val}</option>`;
});
html += `</select>
        <!-- Plant Name Input -->
        <label for="searchInput">Enter Plant Name (Optional):</label>
        <input type="text" id="searchInput" name = "searchInput" placeholder="Search plant by name...">
        <!-- Height Input -->
        <label for="heightInput">Enter Desired Height Range (in feet):</label>
        <input type="text" id="heightInput" placeholder="e.g. 10-20'" name = "heightInput">
	<label for="habitInput">Select Plant Habit:</label>
        <select id="habitInput" name = "habitInput">
	<option value="">--Select Habit--</option>`;

uniqueHabitValues.forEach(val => {
html += `<option value=${val}>${val}</option>`;
});
html += `</select>
        <!-- Bloom Input -->
        <label for="bloomInput">Enter Bloom Period (Month-Month):</label>
        <input type="text" id="bloomInput" name = "bloomInput" placeholder="e.g. April - June">
        <!-- Duration Input -->
        <label for="durationInput">Select Plant Duration:</label>
        <select id="durationInput" name = "durationInput">
            <option value="">--Select Duration--</option>`;

uniqueDurationValues.forEach(val => {
html += `<option value=${val}>${val}</option>`;
});
html += `</select>
        <button>Get Recommendations</button>
        <div id="aiPrediction" name = "aiPrediction"></div>
    </div>
        <div id="plantList"></div>
</main>
<script>
                const plants = ${JSON.stringify(results)};
});
}



</script>
                        </body>
                        </html>
                    `;
 res.send(html);
}
});
});

app.post('/getplant', (req, res) => {
let plantId = req.query.id;
let html= `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Garden State On a Budget</title>
                            <link rel="stylesheet" href="style.css">
                        </head>
                        <body>
                            <header>
                                <nav>
                                    <ul>
                                        <li><a href='/dashboard'>Dashboard</a></li>
                                        <li>
                                            <form action="/logout" method="post">
                                                <button type="submit">Logout</button>
                                            </form>
                                        </li>
                                    </ul>
                                </nav>
                            </header>
                            <main>
    <div class="container">`;
let url = "/creategarden?plantid=" + plantId;
 html += `<form id="setgarden" method="POST" action="/creategarden\?plant=${plantId}">
        <h1>Add Plant to Garden</h1>
<div id = "nameDiv">
        <label for="gardenName">Garden Name:</label>
        <input type = "text" id="gardenName" name = "gardenName" onkeyup="getGardenName()" placeholder="Search for garden names.." title="Type in a name">
<ul id="myUL">`;


        // Query to find the user by email
        mysqlConnection.query('SELECT id FROM Users WHERE email = ?', [user_email], (err, rows) => {
            if (err) {
                console.error('Error while performing Query.', err);
                return res.status(500).send('Internal Server Error');
            }

            // If no user is found with the provided email
            if (rows.length === 0) {
                console.log('Email not found');
                return res.status(404).send('User not found.');
            }

        mysqlConnection.query('SELECT garden_name FROM Garden WHERE user_id = ?', [user_id], (err, rows1) => {
rows1.forEach(row1 => {
html += `  <li><a href="#">${row1.garden_name}</a></li>`;
});
html += `</ul></div><br>
<label for="gardenLocation" id = "gardenLocationLabel">Garden Location:</label>
        <input type = "text" id="gardenLocation" name = "gardenLocation">
<br>
<label for="plantQty">Quantity of This Plant:</label>
        <input type = "number" id="plantQty" name = "plantQty">
<br>
<label for="cost">Cost:</label>
        <input type = "number" id="cost" name = "cost">
<br>

<label for="budget" id ="budgetLabel">Garden Budget:</label>
        <input type = "number" id="budget" name = "budget">
<br>
<label for="deadline" id = "deadlineLabel">Budget Deadline:</label>
        <input type = "date" id="deadline" name = "deadline">

<br><br>
<button type= "submit">Add Plant to Garden</button>
<br><br>
</form>
    </div>

</main>
<script src = "garden.js"></script>
</body>
</html>`;


res.send(html);
});
});
app.post('/creategarden', (req, res) => {
    const plant_id = req.query.plant; // Access the ID from the URL parameters
console.log(plant_id)
    const gardenName = req.body.gardenName;
    const gardenLocation = req.body.gardenLocation;
    const plantQty = req.body.plantQty;
    const budget = req.body.budget;
    const deadline = req.body.deadline;
    const cost = req.body.cost;
console.log(req.body + ' ' + cost);
    const token = req.cookies.token; // Get token from cookie

    
        // Query to find the user by email
        mysqlConnection.query('SELECT id FROM Users WHERE email = ?', [user_email], (err, rows) => {
            if (err) {
                console.error('Error while performing Query.', err);
                return res.status(500).send('Internal Server Error');
            }

            // If no user is found with the provided email
            if (rows.length === 0) {
                console.log('Email not found');
                return res.status(404).send('User not found.');
            }
let sql;            
let user_id = rows[0].id; // Get the user ID from the query result
if (budget) {
    // Proceed to insert the garden application
    sql = `INSERT INTO Garden (user_id, garden_name, location) VALUES (?, ?, ?)`;
    mysqlConnection.query(sql, [user_id, gardenName, gardenLocation], (err, result) => {
        if (err) {
            console.error('Error while inserting garden.', err);
            return res.status(500).send('Error submitting application');
        }

        console.log('Garden insertion completed');

        // Get the inserted garden's ID
        gardenId = result.insertId;

        // Do something with gardenId, e.g., insert into another table
        // For example, insert into a Budget table if needed
        // Insert Budget, or other logic using gardenId
    });
} else {
    // Select the garden based on user_id and garden_name
    sql = `SELECT * FROM Garden WHERE user_id = ? AND garden_name = ?`;
    mysqlConnection.query(sql, [user_id, gardenName], (err, rows) => {
        if (err) {
            console.error('Error while querying garden.', err);
            return res.status(500).send('Error querying application');
        }

        if (rows.length > 0) {
            console.log('Garden already exists:', rows);
            gardenId = rows[0].id;

            // Now you have the gardenId, do something with it
        } else {
            console.log('No garden found for this user and name.');
        }
    });
}
sql = `SELECT * FROM Garden WHERE user_id = ? AND garden_name = ?`;
    mysqlConnection.query(sql, [user_id, gardenName], (err, rows) => {
        if (err) {
            console.error('Error while querying garden.', err);
            return res.status(500).send('Error querying application');
        }

        if (rows.length > 0) {
            console.log('Garden already exists:', rows);
            gardenId = rows[0].id;

            // Now you have the gardenId, do something with it
        }
const sql1 = `INSERT INTO UserPlants (user_id, plant_id, garden_id, quantity)
                         VALUES (?, ?, ?, ?)`;
            mysqlConnection.query(sql1, [user_id, plant_id, gardenId, plantQty], (err, result1, rows) => {
                if (err) {
                    console.error('Error while inserting application.', err);
                }
console.log('UserPlants completed');
    const userplant_id = result1.insertId;  // Retrieve the last inserted id (userplant_id)

mysqlConnection.query(`SELECT spent_amount FROM Budget WHERE garden_id = ?`, [user_id, gardenId], (err, rows4) => {
if (err) {
console.log(err);
}
//console.log(rows4);

let amt = 0;
if(budget){
const sql2 = `INSERT INTO Budget (garden_id, budget_amount, spent_amount, end_month_year)
                         VALUES (?, ?, ?, ?)`;
            mysqlConnection.query(sql2, [gardenId, budget, cost, deadline], (err, result2) => {
                if (err) {
                    console.error('Error while inserting application.', err);
                    return res.status(500).send('Error submitting application');
                }
});
console.log('Budget completed');
}
else{
console.log('update');
    const sql2 = `UPDATE Budget SET spent_amount = ? WHERE garden_id = ?`;
    mysqlConnection.query(sql2, [cost, gardenId], (err, result2) => {
        if (err) {
            console.error('Error while updating application.', err);
            return res.status(500).send('Error updating application');
        } else {
            console.log('Update successful');
            
        }
    });
}
const sql3 = `INSERT INTO Transactions (user_id, userplant_id, amount_spent, quantity)
                         VALUES (?, ?, ?, ?)`;
if(rows4.length > 0){
amt = rows4[rows4.length - 1].spent_amount + cost;
}
else {amt = cost;}
            mysqlConnection.query(sql3, [user_id, userplant_id, amt, plantQty], (err, result3) => {
                if (err) {
                    console.error('Error while inserting application.', err);
                    return res.status(500).send('Error submitting application');
                }
console.log('Transaction completed');
});
            
});
        });
    });
});
});

let html = `<script>
alert("Garden Created Successfully!");
window.location.href = "/dashboard";
</script>`;
res.send(html);
});
    

app.post('/myarboretum', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garden State On a Budget</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <header>
            <nav>
                <ul>
                    <li><a href='/dashboard'>Dashboard</a></li>
                    <li>
                        <form action="/logout" method="post">
                            <button type="submit">Logout</button>
                        </form>
                    </li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="arboretumSection">
                <div class="arboretum-container">`;

    const token = req.cookies.token; // Get token from cookie

    

        // Query to find the user by email
        mysqlConnection.query('SELECT id, username FROM Users WHERE email = ?', [user_email], (err, userRows) => {
            if (err) {
                console.error('Error while performing Query.', err);
                return res.status(500).send('Internal Server Error');
            }

            // If no user is found with the provided email
            if (userRows.length === 0) {
                console.log('Email not found');
                return res.status(404).send('User not found.');
            }

            let user_id = userRows[0].id;
            html += `<h1>Budgeting ${userRows[0].username}'s Arboretum</h1></div><div class="arboretumList">`;

            // Query gardens
            mysqlConnection.query('SELECT * FROM Garden WHERE user_id = ?', [user_id], (err, gardens) => {
                if (err) {
                    console.error('Error while performing Query.', err);
                    return res.status(500).send('Internal Server Error');
                }

                const gardenData = []; // To store data for all gardens
                const gardenPromises = gardens.map(garden => {
                    let gardenHTML = `<form id = "getplantform" action = "/myplants?name=${garden.garden_name}" method = "POST"><button class="garden-card" id="${garden.id}"> 
                                        <center><h4>${garden.garden_name}</h4></center><br> 
                                        <strong>Garden Location:</strong> ${garden.location} <br> 
                                        <strong>Started:</strong> ${garden.created_at} <br>`;

                    // Get user plants for the garden
                    const plantPromise = new Promise((resolve, reject) => {
                        mysqlConnection.query('SELECT * FROM UserPlants WHERE garden_id = ?', [garden.id], (err, plants) => {
                            if (err) return reject(err);
                            plants.forEach(plant => {
                                gardenHTML += `<strong>Plants:</strong> ${plant.quantity}<br>`;
                            });
                            resolve();
                        });
                    });

                    // Get budget for the garden
                    const budgetPromise = new Promise((resolve, reject) => {
                        mysqlConnection.query('SELECT * FROM Budget WHERE garden_id = ?', [garden.id], (err, budgets) => {
                            if (err) return reject(err);
                            if (budgets.length > 0) {
                                budgets.forEach(budget => {
                                    gardenHTML += `<strong>Budget:</strong> $${budget.budget_amount} <br> 
                                                   <strong>Amount Spent:</strong> $${budget.spent_amount} <br> 
                                                   <strong>Deadline:</strong> ${budget.end_month_year} <br> 
                                                   <center><canvas width="150px" height="150px" id="chart${garden.id}"></canvas></center><br>`;
                                    // Store the garden's budget and expense for chart rendering
                                    gardenData.push({
                                        gardenId: garden.id,
                                        budget: budget.budget_amount,
                                        spent: budget.spent_amount
                                    });
                                });
                            } else {
                                gardenHTML += `<strong>No budget data available</strong><br>`;
                            }
                            gardenHTML += `</button></form>`; // Close garden card
                            resolve();
                        });
                    });

                    return Promise.all([plantPromise, budgetPromise]).then(() => gardenHTML);
                });

                Promise.all(gardenPromises)
                    .then(gardenHTMLs => {
                        html += gardenHTMLs.join('');
                        html += `</div></section></main>
                                
                            </body></html>`;
                        res.send(html);
                    })
                    .catch(err => {
                        console.error('Error processing gardens', err);
                        res.status(500).send('Internal Server Error');
                    });
            });
        });
    });
});



app.post('/myplants', (req, res) => {
    const gardenName = req.query.name;
    let html1 = ''; // Initialize html1 to avoid undefined errors
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garden State On a Budget</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <header>
            <nav>
                <ul>
                    <li><a href='/dashboard'>Dashboard</a></li>
                    <li>
                        <form action="/logout" method="post">
                            <button type="submit">Logout</button>
                        </form>
                    </li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="arboretumSection">
                <div class="arboretum-container">`;

    

        // Query to find the user by email
        mysqlConnection.query('SELECT id, username FROM Users WHERE email = ?', [user_email], (err, userRows) => {
            if (err) {
                console.error('Error querying user:', err); // Log error
                return res.status(500).send('Internal Server Error');
            }

            if (userRows.length === 0) {
                console.log('No user found for this email.'); // Log no user found
                return res.status(404).send('User not found.');
            }

            let user_id = userRows[0].id;
            html += `<h1>Budgeting ${userRows[0].username}'s Arboretum</h1></div><div class="arboretumListForPlants">`;

            // Query gardens
            mysqlConnection.query('SELECT * FROM Garden WHERE user_id = ? AND garden_name = ?', [user_id, gardenName], (err, gardens) => {
                if (err) {
                    console.error('Error querying gardens:', err); // Log error
                    return res.status(500).send('Internal Server Error');
                }

                // Check if any gardens were found
                if (gardens.length === 0) {
                    console.log('No gardens found for this user and name.'); // Log no gardens found
                    return res.status(404).send('No gardens found.');
                }

                const gardenData = []; // To store data for all gardens
                let gardenPromises = gardens.map(garden => {
                    html += `<form id="getplantform" action="/myplants?name=${garden.garden_name}" method="POST">
                                      <button class="garden-card" id="${garden.id}">
                                      <center><h4>${garden.garden_name}</h4></center><br> 
                                      <strong>Garden Location:</strong> ${garden.location} <br> 
                                      <strong>Started:</strong> ${garden.created_at} <br>`;

                    // Get user plants for the garden
                    return new Promise((resolve, reject) => {
                        mysqlConnection.query('SELECT * FROM UserPlants WHERE garden_id = ?', [garden.id], (err, plants) => {
                            if (err) {
                                console.error('Error querying plants:', err); // Log error
                                return reject(err); // Reject the promise
                            }

                            // Create an array of promises for querying actual plants
                            const plantPromises = plants.map(plant => {
                                return new Promise((resolvePlant, rejectPlant) => {
                                    mysqlConnection.query('SELECT * FROM Plants WHERE id = ?', [plant.plant_id], (err, actualPlant) => {
                                        if (err) {
                                            console.error('Error querying actual plant:', err); // Log error
                                            return rejectPlant(err); // Reject the promise
                                        }

                                        // Check if actualPlant returned any data
                                        if (actualPlant.length > 0) {
                                            html += `<strong>Plants:</strong> ${plant.quantity}`;

                                            // Use forEach to iterate over the actualPlant
                                            actualPlant.forEach(actual => {
                                                // Create the collapsible button and content
                                                let buttonHTML = `
                                                    <button type="button" class="collapsible">
                                                        <strong>Common Name:</strong> ${actual.common_name} 
							<strong>Quantity:</strong> ${plant.quantity}`;
                                                        
                                                    let contentHTML = `</button>
                                                    <div class="content" style="display: none;">
							<center><strong>Scientific Name:</strong> ${actual.scientific_name} 
                                                        <strong>Family:</strong> ${actual.family} 
                                                        <strong>Duration:</strong> ${actual.duration} 
                                                        <strong>Habit:</strong> ${actual.habit} 
                                                        <strong>Light:</strong> ${actual.light} 
                                                        <strong>Soil Moisture:</strong> ${actual.soil_moisture} 
                                                        <strong>Height:</strong> ${actual.height} 
                                                        <strong>Bloom:</strong> ${actual.bloom}</center>
<br>`;
let totalCost = 0;
let tablehtml = `<center><table><tr><th>Date</th><th>Expense ($)</th><th>Quantity</th></tr>`;


		                                  let userplantId = plant.id;
                                                // Query for transactions related to the actual plant
                                                mysqlConnection.query('SELECT * FROM Transactions WHERE user_id = ? AND userplant_id= ?', [user_id, userplantId], (err, transaction) => {
                                                    if (err) {
                                                        console.error('Error querying transactions:', err); // Log error
                                                        return rejectPlant(err); // Reject the promise
                                                    }

                                                    // Check if there are transactions
                                                    if (transaction.length > 0) {
transaction.forEach(val => {
                                                        tablehtml += `<tr><td>${val.transaction_date}</td>
								<td>${val.amount_spent}</td>
								<td>${val.quantity}</td>
								</tr>`;
totalCost+= val.amount_spent;
});
                                                    

} else {

                                                        tablehtml += `<tr><td>No transactions found for this plant.</td><td>No transactions found for this plant.</td><td>No transactions found for this plant.</td></tr>`;
                                                    }
tablehtml += '</table></center>';
buttonHTML += ` <strong>Cost Thus Far:</strong> $${totalCost}`;

                                                    html1 += `${buttonHTML}${contentHTML}${tablehtml}</div>`; // Close content div

                                                    resolvePlant(); // Resolve the plant promise after processing transactions
                                                });
                                            });
                                        } else {
                                            console.warn(`No plant found with id: ${plant.plant_id}`); // Log warning if no plant found
                                            resolvePlant(); // Resolve even if no plant found
                                        }
                                    });
                                });
                            });

                            // Wait for all plant promises to complete
                            Promise.all(plantPromises)
                                .then(() => {

                                    // Get budget for the garden
                                    mysqlConnection.query('SELECT * FROM Budget WHERE garden_id = ?', [garden.id], (err, budgets) => {
                                        if (err) {
                                            console.error('Error querying budgets:', err); // Log error
                                            return reject(err); // Reject the promise
                                        }

                                        if (budgets.length > 0) {
                                            budgets.forEach(budget => {
                                                html += `<strong>Budget:</strong> $${budget.budget_amount} <br> 
                                                               <strong>Amount Spent:</strong> $${budget.spent_amount} <br> 
                                                               <strong>Deadline:</strong> ${budget.end_month_year} <br> 
                                                               <center><canvas width="150px" height="150px" id="chart${garden.id}"></canvas></center><br>`;
                                                // Store the garden's budget and expense for chart rendering
                                                gardenData.push({
                                                    gardenId: garden.id,
                                                    budget: budget.budget_amount,
                                                    spent: budget.spent_amount
                                                });
                                            });
                                        } else {
                                            html += `<strong>No budget data available</strong><br>`; // No budget data message
                                        }
                                        html += `</button></form>`; // Close garden card
                                        resolve(); // Resolve the promise
                                    });
                                })
                                .catch(reject); // Reject if any of the plant queries failed
                        });
                    });
                });

                // Handle all garden promises
                Promise.all(gardenPromises)
                    .then(gardenHTMLs => {
                        html += `</div></section></main>
                                
${html1}

        <script>
            var coll = document.getElementsByClassName("collapsible");
            for (var i = 0; i < coll.length; i++) {
                coll[i].addEventListener("click", function() {
                    this.classList.toggle("active");
                    var content = this.nextElementSibling;
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                });
            }
        </script>

        </body>
        </html>`;
                        res.send(html); // Send the constructed HTML response
                    })
                    .catch(err => {
                        console.error('Error processing gardens:', err); // Log error
                        res.status(500).send('Internal Server Error');
                    });
            });
        });
    });
});









// Middleware to verify JWT
function verifyToken(req, res, next) {
    const token = req.cookies.token; // Get token from cookie

    if (!token) {
        return res.status(403).send('No token provided!');
    }

    jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized!');
        }
        // Token is valid, you can access decoded information
        res.send(`Welcome back, ${decoded.email}!`);
    });
}

// Example of a secured route
app.get('/secure-data', verifyToken, (req, res) => {
    res.status(200).send({ message: 'This is secure data.' });
});


app.post('/logout', (req, res) => {
let token = req.cookies.token;
    //console.log(token);
    if (token){
        //console.log('before:' + token);
        res.clearCookie('token');
        console.log('after:' + token);
        res.send("<script>window.location.href = '/'</script>");	 
    
    }

else{
        res.send("<script>window.location.href = '/'</script>");	 

}
});

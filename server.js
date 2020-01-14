// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    
    //Movies
    db.run(
      "CREATE TABLE Movies (id INTEGER PRIMARY KEY AUTOINCREMENT, movie TEXT, year TEXT)"
    );
    console.log("New table Movies created!");

    // insert default movies
    db.serialize(() => {
      db.run(
        'INSERT INTO Movies (movie, year) VALUES ("The Farewell", "2019"), ("Black Panther", "2018")'
      );
    });
  } else {
    console.log('Database "Movies" ready to go!');
    db.each("SELECT * from Movies", (err, row) => {
      if (row) {
        console.log(`record: ${row.movie}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all the movies in the database
app.get("/getMovies", (request, response) => {
  console.log("GET MOVIES");
  db.all("SELECT * from Movies", (err, rows) => {
    console.log(rows);
    response.send(JSON.stringify(rows));
  });
});

// endpoint to add a movie to the database
app.post("/addMovie", (request, response) => {
  console.log(`add to movies ${request.body}`);

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    const cleansedMovie = cleanseString(request.body.movie);
    const cleansedYear = cleanseString(request.body.year);
    db.run(`INSERT INTO Movies (movie, year) VALUES (?)`, cleansedMovie, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

// endpoint to clear movies from the database
app.get("/clearMovies", (request, response) => {
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Movies",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Movies WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
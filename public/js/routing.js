const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db_connection");
const cookieParser = require('cookie-parser')
const path = require('path')
const app = express();
const port = 3000;
let importantVariableUserName = ''
let cookiedScore = 0

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.static("public"));
app.post('/', (req, res) => {
  const {score} = req.body
  const user = req.cookies.user
  db.run(
    "UPDATE user SET user_score = ? WHERE user_name = ?",
    [score, user]
  )
})

// POST request to /login
app.post("/login", (req, res) => {
  const { username1, password1 } = req.body;

  db.get(
    `SELECT * FROM user WHERE user_name = "${username1}" AND user_password = "${password1}"`,
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database Error");
      }

      if (row) {
        console.log("Data is true");
        // localStorage.setItem('user_name', username1)
        res.cookie('user', username1)
        return res.redirect("/");
      } else {
        return res.redirect("/auth");
      }
    }
  );
});
app.get('/scoreboard', (req, res) => {
  const scoreboard = score => {return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="css/main.css" />
      <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
      <script src="https://www.w3schools.com/lib/w3.js"></script>
  </head>
  <body>
      <div class="header" w3-include-html="./htmlElements/header.html"></div>
      
      <div class="scoreboard" id="main">
        <div class="scoreboard-table" id="names">
          ${score.map(scoreItem => `<div>${scoreItem.user_name}</div>`).join('')}
          </div>
          <div class="scoreboard-table" id="score">
          ${score.map(scoreItem => `<div>${scoreItem.user_score}</div>`).join('')}
          </div>
      </div>
      <script>w3.includeHTML()</script>
  </body>
  </html>`}
  db.all("SELECT * FROM user", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database Error");
    }

    if (rows.length) {
      res.send(scoreboard(rows))
    } 
  })
  })
// POST request to /auth
app.get('/auth', (req, res) => res.sendFile(path.join(process.cwd(), '/public/auth.html')))
app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    db.get("SELECT * FROM user WHERE user_name = ?", [username], (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database Error");
      }

      if (row) {
        console.log("Username already exists in the database");
        return res.redirect("/auth");
      } else {
        db.run(
          "INSERT INTO user (user_name, user_password) VALUES (?, ?)",
          [username, password],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Database Error");
            }
            // localStorage.setItem('user_name', username)
            // importantVariableUserName = username
            res.cookie('user', username)
            return res.redirect("/");
          }
        );
      }
    });
  } else res.redirect("/auth");
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
// Closing the database connection on server close
app.on("close", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
});

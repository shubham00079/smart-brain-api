const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const { response } = require("express");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "shubham",
    password: "shubham0709",
    database: "smart-brain",
  },
});

// db.select("*")
//   .from("users")
//   .then((data) => {
//     console.log(data);
//   });

const app = express();

app.use(express.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "Sally",
      email: "sally@gmail.com",
      password: "banana",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "James",
      email: "james@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [
    {
      id: "431",
      hash: "",
      email: "john@gmail.com",
    },
  ],
};

app.get("/", (req, res) => {
  res.send(database.users);
});
// creating a route

// app.post("/signin", (req, res) => {
//   bcrypt.compare(
//     "apples",
//     "$2a$10$.zdXhKhtOj411kaIzL1Y7Oh05OL7Gs53SKg9g6zHqWxEpqwEQVDuW",
//     function (err, res) {
//       // res == true
//       console.log("first guess", res);
//     }
//   );
//   bcrypt.compare(
//     "veggies",
//     "$2a$10$.zdXhKhtOj411kaIzL1Y7Oh05OL7Gs53SKg9g6zHqWxEpqwEQVDuW",
//     function (err, res) {
//       // res = false
//       console.log("second guess", res);
//     }
//   );

//   if (
//     req.body.email === database.users[0].email &&
//     req.body.password === database.users[0].password
//   ) {
//     res.json(database.users[0]);
//   } else {
//     res.status(400).json("error logging in");
//   }
// });

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      console.log(data);
    });
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  // hashing password synchronous way
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("Unable to Process request"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({
      id: id,
    })
    .then((user) => {
      console.log(user);
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not Found");
      }
    })
    // only returns a res when user exists
    .catch((err) => res.status(400).json("error getting user"));
  // if (!found) {
  //   res.status(400).json("not found");
  // }
});

// app.post("/images", (req, res) => {
//   const { id } = req.body;
//   let found = false;
//   database.users.forEach((user) => {
//     if (user.id === id) {
//       found = true;
//       user.entries++;
//       return res.json(user.entries);
//     }
//   });
//   if (!found) {
//     res.status(400).json("not found");
//   }
// });

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json("Unable to find entries"));
});

app.listen(3000, () => {
  console.log("running on port 3000");
});

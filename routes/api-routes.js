const User = require("../models/User");
const Expenses = require("../models/Expenses");
const Income = require("../models/Income");
const jwt = require("jsonwebtoken");
const authWare = require("../middleware/authware");
var axios = require("axios");
var cheerio = require("cheerio");
const Article = require("../models/Article.js");

module.exports = function (app) {
  app.post("/api/signup", function (req, res) {
    User.create(req.body)
      .then(function (result) {
        res.json({ message: "user created" });
      })
      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.post("/api/authenticate", function (req, res) {
    const { username, password } = req.body;
    User.findOne({ username: username }).then(function (dbUser) {
      if (!dbUser)
        return res
          .status(401)
          .json({ message: "Username or password is incorrect." });
      if (dbUser.comparePassword(password)) {
        const token = jwt.sign(
          {
            data: dbUser._id
          },
          "superSecretKey"
        );

        res.json({
          id: dbUser._id,
          username: dbUser.username,
          token: token
        });
      } else {
        res.status(401).json({ message: "Username or password is incorrect." });
      }
    });
  });

  app.get("/api/users", function (req, res) {
    User.find()
      .populate("expenses")
      .populate("income")
      .then(function (dbUser) {
        console.log("Get all Users", dbUser);
        res.json(dbUser);
      })
      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.get("/api/user/:id", function (req, res) {
    User.findOne({ _id: req.params.id })
      .populate("expenses")
      .populate("income")
      .then(function (dbUser) {
        console.log("Get one user", dbUser);
        res.json(dbUser);
      })
      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.post("/api/add-expense/:id", authWare, function (req, res) {
    Expenses.create(req.body)
      .then(function (result) {
        return User.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { expenses: result._id } },
          { new: true }
        );
      })
      .then(function () {
        res.end();
      })
      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.post("/api/add-income/:id", authWare, function (req, res) {
    Income.create(req.body)
      .then(function (result) {
        return User.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { income: result._id } },
          { new: true }
        );
      })
      .then(function () {
        res.end();
      })
      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.get("/api/getIncome/:id", authWare, function (req, res) {
    User.findOne({ _id: req.params.id })
      .populate("income")
      .then(function (result) {
        console.log("income", result);
        res.json(result);
      })

      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.get("/api/getExpenses/:id", authWare, function (req, res) {
    User.findOne({ _id: req.params.id }, "-password")
      .populate("expenses")
      .then(function (result) {
        console.log("expense", result);
        res.json(result);
      })

      .catch(function (err) {
        res.status(500).json({ error: err.message });
      });
  });

  app.delete("/api/deleteIncome/:id", function (req, res) {
    // Remove a note using the objectID
    console.log("Thisisisisisisisisisiis", +req.params);
    Income.remove(
      {
        _id: req.params.id
      },
      function (error, removed) {
        // Log any errors from mongojs
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          // Otherwise, send the mongojs response to the browser
          // This will fire off the success function of the ajax request
          console.log(removed);
          res.send(removed);
        }
      }
    );
  });

  app.delete("/api/deleteExpenses/:id", function (req, res) {
    // Remove a note using the objectID
    console.log("Thisisisisisisisisisiis", +req.params);
    Expenses.remove(
      {
        _id: req.params.id
      },
      function (error, removed) {
        // Log any errors from mongojs
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          // Otherwise, send the mongojs response to the browser
          // This will fire off the success function of the ajax request
          console.log(removed);
          res.send(removed);
        }
      }
    );
  });

  app.put("/api/updateIncome/:id", function (req, res) {
    Income.findByIdAndUpdate(
      // the id of the item to find
      req.params.id,

      // the change to be made. Mongoose will smartly combine your existing
      // document with this change, which allows for partial updates too
      req.body,

      // an option that asks mongoose to return the updated version
      // of the document instead of the pre-updated one.
      { new: true },

      // the callback function
      (err, results) => {
        // Handle any possible database errors
        if (err) return res.status(500).send(err);
        return res.send(results);
      }
    );
  });

  app.put("/api/updateExpenses/:id", function (req, res) {
    Expenses.findByIdAndUpdate(
      // the id of the item to find
      req.params.id,

      // the change to be made. Mongoose will smartly combine your existing
      // document with this change, which allows for partial updates too
      req.body,

      // an option that asks mongoose to return the updated version
      // of the document instead of the pre-updated one.
      { new: true },

      // the callback function
      (err, results) => {
        // Handle any possible database errors
        if (err) return res.status(500).send(err);
        return res.send(results);
      }
    );
  });

  // A GET route for scraping the echoJS website
  app.get("/article/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.thestreet.com/personal-finance").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $(".news-list__block").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children(".news-list__body")
          .children("a")
          .children("h3")
          .text();
        result.body = $(this)
          .children(".news-list__body")
          .children("p")
          .text();
        result.link = "https://www.thestreet.com" + $(this)
          .children("a")
          .attr("href");
        result.imgLink = "https:"+$(this)
          .children("a")
          .children("picture")
          .children("img")
          .attr("src");

        // Create a new Article using the `result` object built from scraping
        Article.create(result)
          .then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
          });
      });

      // Send a message to the client
      res.send("Scrape Complete");
    });
  }); 

  app.delete("/article/clear", function (req, res) {

    Article.deleteMany({})
      .then(function (result) {
        res.end("Articles cleared");
      }).catch(function (err) {
        res.end(err);
      })
  });
};

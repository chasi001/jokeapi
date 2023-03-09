var express = require("express")
var app = express()
var db = require("./database.js")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

//get all jokes
app.get("/api/jokes", (req, res, next) => {
    var sql =
    `SELECT * FROM jokes 
     `
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get joke by id
app.get("/api/jokes/:id", (req, res, next) => {
    var sql = 
    `SELECT * FROM jokes
     WHERE jokes.id = ?`
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//get all jokes of a category with ID
app.get("/api/jokes/categories/:id", (req, res, next) => {
    var sql = 
    `SELECT joke, category FROM jokes
     JOIN jokecategory jc ON jc.joke_id = jokes.id
     JOIN categories c ON c.id = jc.category_id 
     where category_id= ?`
    var params = [req.params.id]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get list of categories
app.get("/api/jokes/category/list/all", (req, res, next) => {
    var sql = 
    `SELECT *
     FROM categories`
    var params = [req.params.gategory]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get random one from all
app.get("/api/jokes/random/all", (req, res, next) => {
    var sql = 
    `SELECT * FROM jokes 
     ORDER BY random() limit 1`
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//select random one from specific category with id
app.get("/api/jokes/random/:id", (req, res, next) => {
    var sql = 
    `SELECT * FROM jokes 
     JOIN jokecategory jc ON jc.joke_id = jokes.id
     JOIN categories c ON c.id = jc.category_id
     WHERE category_id = ? 
     ORDER BY RANDOM() LIMIT 1`
    var params = [req.params.id]
    
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//add a joke
app.post("/api/joke/", (req, res, next) => {
    var errors=[]
    if (!req.body.joke){
        errors.push("No joke specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        joke: req.body.joke,
        likes: 0,
        dislikes: 0
    }
    var sql ='INSERT INTO jokes (joke, likes, dislikes) VALUES (?,?,?)'
    var params =[data.joke, data.likes, data.dislikes]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

//add new joke to a category with category id
app.post("/api/joke/category/:id", (req, res, next) => {
    var errors = []
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        joke: req.body.joke,
        likes: 0,
        dislikes: 0,
        jokeid: 0
    }
    var sql ='INSERT INTO jokes (joke, likes, dislikes) VALUES (?,?,?)'
    var sql1 ='INSERT INTO jokecategory (category_id, joke_id) VALUES (?,?)'
    var params =[data.joke, data.likes, data.dislikes]
    var params1 = []
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        jokesId = this.lastID
        params1.push(req.params.id, jokesId.toString())

        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })

        db.run(sql1, params1, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }

    });

    })

})

//add category
app.post("/api/joke/category", (req, res, next) => {
    var errors=[]
    if (!req.body.category){
        errors.push("No category specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        category: req.body.category
    }
    var sql ='INSERT INTO categories (category) VALUES (?)'
    var params =[data.category]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})
// adding an existing joke to a category
app.post("/api/jokes/", (req, res, next) => {
    var errors=[]
    if (!req.body.joke_id){
        errors.push("No joke ID specified");
    }
    if (!req.body.category_id){
        errors.push("No category specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        categoryId: req.body.category_id,
        jokeId: req.body.joke_id

    }
    var sql ='INSERT INTO jokecategory (category_id, joke_id) VALUES (?,?)'
    var params =[data.categoryId, data.jokeId]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

//modify joke with id
app.patch("/api/jokes/:id", (req, res, next) => {
    var data = {
        joke: req.body.joke
    }
    db.run(
        `UPDATE jokes set 
           joke = COALESCE(?,joke),
           WHERE id = ?`,
        [data.joke, data.category_id, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

//give vote
app.put("/api/jokes/vote/:id", (req, res, next) => {

    var data = {
        likes: req.body.likes,
        dislikes: req.body.dislikes,
        //modified: new Date().toLocaleString()
    }
    var voted = {
        like: 0,
        dislike: 0
    }
    if (!data.likes&& !data.dislikes){
        console.log("No votes given!");
    }else {
        if (data.likes){
            voted.like = 1;
        }
        if (data.dislikes){
            voted.dislike = 1;
        }
        db.run(
            `UPDATE jokes SET 
               likes = likes + ?,
               dislikes = dislikes + ?
               where id=?
               `,
            [voted.like, voted.dislike, req.params.id],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": res.message})
                    return;
                }
                res.json({
                    message: "success",
                    data: data,
                    changes: this.changes
                })
        });
    }

})

app.delete("/api/joke/:id", (req, res, next) => {
    db.run(
        'DELETE FROM jokes WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});

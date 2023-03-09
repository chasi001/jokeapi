var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT
        )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
            }
        });
        db.run(`CREATE TABLE jokes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            joke text, 
            likes integer,
            dislikes integer
        )`,
        (err) => {
            if (err) {
                // Table already created
                console.log("Table/s already created");
            }else{
                // Table just created, creating some rows
                console.log("Tbales created");
            }
        });
        db.run(`CREATE TABLE jokecategory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id integer,
            joke_id integer,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (joke_id) REFERENCES jokes (id)
        )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
            }
        });
    }
});


module.exports = db
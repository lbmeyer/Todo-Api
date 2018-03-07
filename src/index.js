const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'todo'
});

try {
    connection.connect();
} catch (e) {
    console.log('Oops. Connection to MySQL failed.');
    console.log(e);
}

const api = express();

api.use(express.static(__dirname + '/public'));
// parse application/json
api.use(bodyParser.json());

api.listen(3000, () => {
    console.log('API up and running!');
});

// // create route for API
// api.get('/', (req, res) => {
//     res.send('Hello World!');
// });

api.get('/tasks', (req, res) => {
    connection.query('SELECT * FROM tasks ORDER BY created DESC', (error, results) => {
        if (error) return res.json({ error: error });

        // Originally we returned results as an object with todo and completed. But we can simplify it 
        // res.json({
        //     todo: results.filter(item => !item.completed),
        //     completed: results.filter(item => item.completed)
        // });

        res.json(results);
    }); 
});


api.post('/tasks/add', (req, res) => {
    console.log(req.body);
    
    // Prepared Query: bind the value (with ?) followed by array so we don't allow malicious code to be inserted. 
    connection.query('INSERT INTO tasks (description) VALUES (?)', [req.body.item], (error, results) => {
        if(error) return res.json({ error: error }); // don't leave in production
        
        // Grab the ID of the last inserted item
        connection.query('SELECT LAST_INSERT_ID() FROM tasks', (error, results) => {
            if(error) return res.json({ error: error});
            
            const task = {
                id: results[0]['LAST_INSERT_ID()'],
                description: req.body.item
            };
            
            // send back object to browser after we've created it
            res.json(task);
        });
    });
});

api.post('/tasks/:id/update', (req, res) => {
    connection.query('UPDATE tasks SET completed = ? WHERE id = ?', [req.body.completed, req.params.id], (error, results) => {
        if(error) return res.json({ error: error});

        res.json({});
    });
});

api.post('/tasks/:id/remove', (req, res) => {
    connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (error, results) => {
        if(error) return res.json({ error: error});

        res.json({});
    });
});
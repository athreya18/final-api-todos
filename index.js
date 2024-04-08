const express = require('express');
const app= express();

const path=require('path');
require("dotenv").config({
    override:true,
    path:path.join(__dirname, '.env' )
});
const { Pool }=require('pg');    

const poolConfig = {
    user:process.env.USER,
    host:process.env.HOST,
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port:process.env.PORT,
    url: process.env.DB_URL
}
const pool= new Pool(poolConfig)
console.log({
    user:process.env.USER,
    host:process.env.HOST,
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port:process.env.PORT,
    url: process.env.DB_URL
})
pool.connect((err) => {
    if (err) {
        return console.error('Error acquiring client', err);
    }
    console.log('Connected to PostgreSQL database');
    // client.query('SELECT current_user', (err, result) => {
    //     release();
    //     if (err) {
    //         return console.error('Error executing query', err.stack);
    //     }
    //     console.log('Current user:', result.rows[0].current_user);
    // });
});
  
var cors = require('cors')

const {v4 : uuidv4} =  require("uuid")
const Joi= require('joi');
const { url } = require('inspector');

app.use(cors())
app.use(express.json());

let todos=[];

//GET
app.get('/', (req, res) => {
    return res.send('Hello World !!');
});

app.get('/api/todos', async(req, res) =>{    
    try{
        const queryText = 'SELECT * FROM todos';
        const result= await pool.query(queryText);

        const todos=result.rows;
        res.status(200).json(todos);
    }catch(error){
        console.log({error})
        return res.status(500).send('Internal Server Error')
    }
});

app.get('/api/todos/:id', (req, res) => {
    const todo = todos.find(c => c.id === (req.params.id));
    if (!todo) {
        res.status(404).send('The todo with the given ID was not found');
    }
    res.send(todo);
});

//POST
app.post('/api/todos', async (req, res) => {
   
    const { title, description, status}= req.body
    const taskId = uuidv4()
    const { error } = validateTodo(req.body);
    if (error) {
        // 400 Bad Request
        return res.status(400).send(error.details[0].message);
    }
    // const todo = {
    //     id: taskId,
    //     title: req.body.title,
    //     description: req.body.description,
    //     status: req.body.status
    // };

    // todos.push(todo);
    const queryText ='INSERT INTO todos (id, title, description, status, createdAt, updatedAt) VALUES ($1,$2,$3,$4, now(), now())';
    const queryValues=[taskId,title,description,status];

    try{

        const result= await pool.query(queryText,queryValues);
        console.log('Task inserted into database');
        const insertedTask = {
            id: taskId,
            title,
            description,
            status,
            createdAt: new Date(),
            updatedAt: new Date()
        };

       return res.status(201).json(insertedTask)
    }catch(error){

        console.log({error})
        return res.status(500).send('Internal Server Error')

    }
});

app.get('/api/posts/:year/:month', (req, res) =>{
    res.send(req.query);
});


//PUT
app.put('/api/todos/:id',async (req, res) =>{
    //Look up the todo, else return 404
    //Validate, if not return 400- bad req
    //update todo and return updated todo
    const todo = todos.find(c => c.id === (req.params.id));
    // console.log(req.params.id)
    // if (!todo) // 404
    //     return res.status(404).send('The Todo with the given ID was not found');

    // const { error } =validateTodo(req.body);
    // if (error)
    //     return res.status(400).send(error.details[0].message);

    // const finalResp = todos.map((resp) => {
    //     if(resp.id === (req.params.id)){
    //         return {
    //             ...resp,
    //             title: req.body.title,
    //             description: req.body.description,
    //             status: req.body.status
    //         }
    //     }else{
    //         return resp
    //     }
    // })
    // todos = finalResp
    // console.log({finalResp})
    
    // if (error) {
    //     // 400 Bad Request
    //     return res.status(400).send(error.details[0].message);
    // }
    // res.send(todos.find(c => c.id === (req.params.id)));
    const { title, description, status}= req.body;
    const taskId=req.params.id;
    const updateQuery= 'UPDATE todos SET title = $1, description= $2,status =$3, "updatedat"=now() WHERE id= $4';   
    const updateValues=[title,description,status,taskId]
    try{
        await pool.query(updateQuery,updateValues);
        console.log('Task updated in database');
        const updatedTaskQuery = 'SELECT * FROM todos WHERE id = $1';
        const updatedTaskResult = await pool.query(updatedTaskQuery, [taskId]);
        const updatedTask = updatedTaskResult.rows[0];
        // res.send(updatedTodo)
        return res.json(updatedTask)

    }catch(error){
        console.error('Error updating task:', error);
        return res.status(500).send('Internal Server Error');
    }
     
    
});
//DELETE
app.delete('/api/todos/:id', async(req,res) => {
    const todoId = req.params.id;        
    const queryText = 'DELETE FROM todos WHERE id = $1';
    const queryValues = [todoId];

    console.log(todoId)
    try {
        await pool.query(queryText, queryValues);
        console.log('Task deleted successfully');
       

        todos = todos.filter(todo => todo.id !== todoId);
        // res.send(todos)
        return  res.status(200).send({"status": "success"});

    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/todos', async(req,res) => {
    const queryText = 'DELETE FROM todos WHERE status = $1';
    const queryValues = ['completed'];
    try {
        await pool.query(queryText, queryValues);
        console.log('Completed tasks deleted successfully');

        const updatedTasksResult = await pool.query('SELECT * FROM todos');
        const updatedTasks = updatedTasksResult.rows;

        return res.status(200).json(updatedTasks);
    } catch (error) {
        console.error('Error deleting completed tasks:', error);
        return res.status(500).send('Internal Server Error');
    }
});

//PORT
const port = process.env.APP_PORT
app.listen(port, ()=> {
    console.log(`Listening on port ${port}...`);
    }
);

function validateTodo(todo){
    const schema = Joi.object({
        title: Joi.string().min(2).required(),
        description: Joi.string().min(2).required(),
        status: Joi.string().required()
    });
    return schema.validate(todo);    
}


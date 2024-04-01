const express = require('express');
var cors = require('cors')
const app= express();
const {v4 : uuidv4} =  require("uuid")
const Joi= require('joi');

app.use(cors())
app.use(express.json());

let todos=[];

//GET
app.get('/', (req, res) => {
    res.send('Hello World !!');
});

app.get('/api/todos',( req, res) =>{    
    res.send(todos);
});

app.get('/api/todos/:id',(req, res) => {
    const todo = todos.find(c => c.id === (req.params.id));
    if (!todo) {
        res.status(404).send('The todo with the given ID was not found');
    }
    res.send(todo);
});

//POST
app.post('/api/todos', (req, res) => {
   
    const { error } =validateTodo(req.body);
    if (error) {
        // 400 Bad Request
        return res.status(400).send(error.details[0].message);
    }
     
    const todo = {
        id: uuidv4(),
        title: req.body.title,
        description: req.body.description,
        status: req.body.status
    };
    todos.push(todo);
    console.log({todos, todo})
    res.send(todo);
});

app.get('/api/posts/:year/:month', (req, res) =>{
    res.send(req.query);
});

//PUT
app.put('/api/todos/:id',(req, res) =>{
    //Look up the todo, else return 404
    //Validate, if not return 400- bad req
    //update todo and return updated todo
    const todo = todos.find(c => c.id === (req.params.id));
    console.log(req.params.id)
    if (!todo) // 404
    res.status(404).send('The Todo with the given ID was not found');

    const { error } =validateTodo(req.body);

    const finalResp = todos.map((resp) => {
        if(resp.id === (req.params.id)){
            return {
                ...resp,
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            }
        }else{
            return resp
        }
    })
    
    todos = finalResp
    console.log({finalResp})
    
    if (error) {
        // 400 Bad Request
        return res.status(400).send(error.details[0].message);
    }
    res.send(todos.find(c => c.id === (req.params.id)));
});

//DELETE
app.delete('/api/todos/:id', (req,res) => {
    //look up for todo else 404
    console.log({req: req.params.id, todos})
    const todo = todos.some(c => c.id === req.params.id)

    console.log(todo)
    if (!todo) {
        res.status(400).send('The todo with the given ID was not found');
    }
    //delete and return the same todo
    
    todos = todos.filter((resp) => {
        return resp.id !== (req.params.id)
    })
    res.send(todos);
});

app.delete('/api/todos', (req,res) => {
    todos = todos.filter((resp) => {
        return resp.status !== "completed"
    })
    res.send(todos);
})

//PORT
const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log(`Listening on port ${port}...`));
function validateTodo(todo){
    const schema = Joi.object({
        title: Joi.string().min(2).required(),
        description: Joi.string().min(2).required(),
        status: Joi.string().required()
    });

    return schema.validate(todo);
    
}


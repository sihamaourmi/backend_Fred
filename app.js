var express = require('express');

var app = express();

var path = require('path');

//bodyparser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

require('dotenv').config();

const cors = require('cors');

app.use(cors());


//Mongodb :
var mongoose = require('mongoose');

const Contact = require('./models/Contact');

const Film = require('./models/Film');

const Post = require('./models/Post');

const User = require('./models/User');

const Blog = require('./models/Blog');


const url = process.env.DATABASE_URL

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log("MongoDB connected !"))
.catch(err => console.log(err))

//Cookie parser

const cookieParser = require('cookie-parser')
app.use(cookieParser());
const {createToken, validateToken} = require("./JWT")


//METHOD OVERRIDE
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// app.get('/', function(req, res){
//     res.send("<html><body><h1>Salut le monde </h1></body></html>");
// });

const bcrypt = require('bcrypt');

//MULTER
const multer = require('multer');

app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Use original file name
    },
});

const upload = multer({storage});

app.post('/upload', upload.single('image'), (req, res) =>{
    if(!req.file){
        res.status(400).send('No file uploaded');
    }
    else{
        res.send('File uploaded successfully')
    }
})

app.post('/uploadFiles', upload.array('images', 5), (req, res) => {
    if(!req.files || req.files.length === 0){
        res.status(400).send('No files uploaded');
    }
    else{
        res.send('Files uploaded successfully');
    }
})

//-----------------BLOG -------------------------------------


app.post('/submit-blog',upload.single('file'), function(req, res){
    if(!req.file){
        res.status(400).send('No file uploaded');
    }
    else{
        res.send('File uploaded successfully')
        const Data = new Blog({
            titre : req.body.titre,
            username : req.body.username,
            imagename : req.body.imagename,
        })
        Data.save().then(() => {
            console.log("Data saved successfully !");
        }).catch(err => { console.log(err)});
    }
})

app.get('/myblog', function(req, res) {
    Blog.find()
    .then(data =>{
        console.log(data);
        res.json(data);
    })
    .catch(err => console.log(err))
});




//----------------------------Contact ----------------------------------------------------------------


app.get('/formulaire', function(req, res){
    res.sendFile(path.resolve('formulaire.html'));
});

app.get('/contact', function(req, res){
    res.sendFile(path.resolve('contact.html'));
});
app.post('/submit-form', function(req, res){

    var name = req.body.firstname + ' ' + req.body.lastname;
    
    res.send(name + ' Submit success !');
});

app.post('/submit-contact', function(req, res){
    // var name = req.body.firstname + ' ' + req.body.lastname;
    // var email = req.body.email;
    // res.send("Bonjour "+ name 
    //     + "<br> Merci de nous avoir contacté. Nous reviendrons vers vous à cette adresse : " + email);

    // var name ="Bonjour "+ req.body.firstname + ' ' + req.body.lastname +  "<br> Merci de nous avoir contacté. Nous reviendrons vers vous à cette adresse : " + req.body.email
    // res.send(name);
    
    // res.send("Bonjour "+ req.body.firstname + ' ' + req.body.lastname 
    //     +  "<br> Merci de nous avoir contacté. Nous reviendrons vers vous à cette adresse : " 
    //         + req.body.email);

    const Data = new Contact({
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        message : req.body.message
    })
    Data.save().then(() => {
        console.log("Data saved successfully !");
        res.redirect('/');
    }).catch(err => { console.log(err)});
});

app.get('/',validateToken, function(req, res) {
    Contact.find()
    .then(data =>{
        console.log(data);
        // res.render('Home', {data: data});
        res.json(data);
    })
    .catch(err => console.log(err))
});

app.get('/contact/:id', function (req, res) {
    console.log(req.params.id);
    Contact.findOne({
        _id: req.params.id
    }).then(data =>{
        res.render('Edit', {data: data});
    })
    .catch(err => console.log(err))
});

app.get('/newcontact', function (req, res) {
    res.render('NewContact');
});

app.put('/contact/edit/:id', function(req, res) {
    console.log(req.params.id);
    const Data = {
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        message : req.body.message
    }
    Contact.updateOne({_id: req.params.id}, {$set: Data})
    .then(data =>{
        console.log("Data updated");
        res.redirect('/')
    })
    .catch(err =>console.log(err));
});


app.delete('/contact/delete/:id', function(req, res) {
    Contact.findOneAndDelete({_id: req.params.id})
    .then(()=>{
        res.redirect('/');
    })
    .catch(err=>console.log(err))
});

//-----------------Film------------------------------------------------

app.get('/newfilm', function (req, res) {
    res.render('NewFilm');
});

app.post('/submitFilm', function (req, res) {
    const Data = new Film({
        nom : req.body.nom,
        date : req.body.date,
        realisateur : req.body.realisateur,
        genre: req.body.genre
    })
    Data.save().then((data) =>{
        console.log("Data saved");
        res.redirect('http://localhost:3000/allfilm/')
    })
});

app.get('/allfilm', function (req, res) {
    Film.find().then((data) => {
        console.log(data);
        // res.render('Allfilm', {data: data});
        res.json(data);
    })
});

app.get('/film/:id', function (req, res) {
    console.log(req.params.id);
    Film.findOne({
        _id: req.params.id
    }).then(data =>{
        // res.render('EditFilm', {data: data});
        res.json(data);
    })
    .catch(err => console.log(err))
});

app.put('/film/edit/:id', function(req, res) {
    console.log(req.params.id);
    const Data = {
        nom: req.body.nom,
        date : req.body.date,
        realisateur : req.body.realisateur,
        genre: req.body.genre
    }
    Film.updateOne({_id: req.params.id}, {$set: Data})
    .then(data =>{
        console.log("Data updated");
        res.redirect('http://localhost:3000/allfilm/')
    })
    .catch(err =>console.log(err));
});

app.delete('/film/delete/:id', function(req, res) {
    Film.findOneAndDelete({_id: req.params.id})
    .then(()=>{
        res.redirect('http://localhost:3000/allfilm/');
    })
    .catch(err=>console.log(err))
});

/****************POST ************/

app.get('/newpost', function(req, res) {
    res.render('NewPost');
});

app.post('/submit-post', function(req, res) {
    const Data = new Post({
        sujet : req.body.sujet,
        auteur : req.body.auteur,
        description : req.body.description
    });
    Data.save().then(()=>{
        console.log("Post saved successfully");
        res.redirect('/allposts');
    }).catch(err => console.log(err));
});


app.get('/allposts', function(req, res) {
    Post.find().then((data) => {
        res.render('AllPost', {data: data});
    })
    .catch(err => console.log(err));
});

app.get('/post/:id', function(req, res) {
    Post.findOne({_id: req.params.id})
    .then((data) => {
        res.render('EditPost', {data: data});
    })
    .catch(err => console.log(err));
});

app.put('/post/edit/:id', function(req, res) {
    const Data = ({
        sujet : req.body.sujet,
        auteur : req.body.auteur,
        description : req.body.description
    })
    Post.updateOne({_id : req.params.id}, {$set : Data})
    .then(() => {
        res.redirect('/allposts')
    })
    .catch(err => console.log(err)); 
    ;
});

app.delete('/post/delete/:id', function(req, res) {
    Post.findOneAndDelete({_id : req.params.id})
    .then(() => {
        res.redirect('/allposts')
    })
    .catch(err => console.log(err));
});


//--------------------------------------USERS --------------------------------

//Inscription
app.post('/api/signup', function(req, res) {
    const Data = new User({
        username : req.body.username,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password, 10),
        admin: false
    })
    Data.save()
    .then((data) => {
        console.log("User saved !");
        // res.render('UserPage', {data: data});
        res.redirect('http://localhost:3000/allfilm')
    })
    .catch(err => console.log(err));
});
app.get('/inscription', function(req, res) {
    res.render('Signup')
});

app.get('/login', function(req, res) {
    res.render('Login');
});

app.post('/api/login', function(req, res) {
    User.findOne({
        username: req.body.username
    }).then((user)=>{
        if(!user)
        {
            res.send('No User found')
        }

        if(!bcrypt.compareSync(req.body.password, user.password))
        {
            res.send("Invalid password !");
        }
        
        const accessToken =createToken(user);

        res.cookie("access-token", accessToken, {
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true
        })
        //res.json("LOGGED IN ! ")
        // console.log("user found");
        // res.render('UserPage', {data: user});
        res.redirect("http://localhost:3000/allfilm")
    }).catch((error)=>{console.log(error)});
});


var server = app.listen(5000, function () {
    console.log("Server listening on port 5000");
});
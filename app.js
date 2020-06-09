const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');


const userModel = require('./models/users');

const app = express();

const jwt = require('jsonwebtoken');

// CHECK LOGIN
function checkLogin(req,res,next){
    var myToken = localStorage.getItem('mytoken');
    try{
        jwt.verify(myToken, 'loginToken');
        console.log('Token Verified');
    } catch (err) {
        console.log('Token NOT FOUND');
       // console.log(err);
        res.send('You are not authorized to view this page');
    }
    next();
}


if(typeof localStorage === 'undefined' || localStorage === null){
    console.log('Not found LocalStorage');
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}else{
    console.log('Found LocalStorage');
}

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));

// MULTER CODE
var storage = multer.diskStorage({
    destination : "./public/uploads",
    filename : (req,file,cb) => {
        cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage:storage
}).single('file');



// ROUTES

app.get('/',checkLogin, (req,res) => {
    var findUser = userModel.find({}, (err,data) => {
        if(err) throw err;
        res.render('index', {title : 'Players', datas : data});
    });
});

app.get('/edit/:id',checkLogin, (req,res) => {
    var userId = req.params.id;
    var edit = userModel.findById({_id:userId})
    edit.exec(function(err,data){
           if(err) throw err;
        res.render('edit', {title : 'Edit Player : '+ data.name, datas : data, success:''});
       }); 
});

app.post('/edit',urlencodedParser,checkLogin, (req,res) => {
    var userId = req.body.uuid;
    var updateUser = userModel.findByIdAndUpdate(userId, {
        name : req.body.name,
        email : req.body.email,
        level : req.body.level,
        kills : req.body.kills,
        matches : req.body.matches
    });

    console.log(req.body.name);
    updateUser.exec(function(err,data){
        if(err) throw err;
         res.redirect('/');
        }); 
});

app.post('/addUser', urlencodedParser,upload,checkLogin, (req,res) => {
    var addUser = new userModel({
        name : req.body.name,
        email : req.body.email,
        level : req.body.level,
        kills : req.body.kills,
        matches : req.body.matches,
        profile : req.file.filename        
    });   
    addUser.save((err,res1) => {
        if(err) throw err;
        res.render('adduser', {title : 'Add User', success : 'User Added Successfully'});
    });

});


app.get('/upload/:id',checkLogin, (req,res) => {
    var userId = req.params.id;
    var edit = userModel.findById({_id:userId})
    edit.exec(function(err,data){
           if(err) throw err;
        res.render('upload', {title : 'Change Profile Pic of '+ data.name, datas : data, success:''});
       }); 
});

app.post('/upload', urlencodedParser,upload,checkLogin, (req,res) => {
    var userId = req.body.uuid;
    var updateUser = userModel.findByIdAndUpdate(userId, {
        profile: req.file.filename
    });
    console.log(req.body.name);
    updateUser.exec(function(err,data){
        if(err) throw err;
         res.redirect('/');
        }); 
});


app.get('/addUser',checkLogin, (req,res) => {
    res.render('adduser', {title : 'Add User', success : ''});
});


app.get('/login', (req,res) => {
    var token = jwt.sign({ foo : 'bar' }, 'loginToken');
    localStorage.setItem('mytoken', token);
    console.log(localStorage.getItem('mytoken'));
    res.send('Logged In Successfully');
});

app.get('/logout', (req,res) => {
    localStorage.removeItem('mytoken');
    res.send('Logout Successfully');
});



app.listen(3000,() => {
    console.log('Server Up and Running');
});
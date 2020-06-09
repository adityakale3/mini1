const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/player', {useNewUrlParser:true, useUnifiedTopology: true});

var conn = mongoose.connection;

conn.on('connected', () => {
    console.log('DB Connected');
});
// DB CON
conn.on('disconnection', () => {
    console.log('DB Dis-connected');
});
// DB CON
conn.on('error', console.error.bind(console,'connection error:'));



var usersSchema = new mongoose.Schema({
    name : String,
    email : String,
    level : String,
    kills : Number,
    matches : Number,
    profile : String
});


var usersModel =  mongoose.model('players', usersSchema, 'players');

module.exports = usersModel;
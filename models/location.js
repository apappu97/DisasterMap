var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
	lat: Number,
	lng: Number,
	status: String 
});

var Person = mongoose.model('Person', locationSchema);

module.exports = Person;
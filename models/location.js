var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
	latitude: Number,
	longitude: Number,
	contentBody: String 
});

var Person = mongoose.model('Person', locationSchema);

module.exports = Person;
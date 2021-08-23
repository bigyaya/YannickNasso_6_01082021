const mongoose = require('mongoose');

//empêche plusieurs utilisateurs avec la même adresse mail
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},//inscription avec adresse mail unique à l'utilisateur
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema)
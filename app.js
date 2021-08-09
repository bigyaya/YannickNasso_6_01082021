const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

require('dotenv').config()


//----------------routes-----------------//
const userRoutes = require('./routes/users');
const sauceRoutes = require('./routes/sauces')


//---------------connection à la base de données--------------------//
mongoose.connect(process.env.MONGODB_PATH,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Lancement de Express
const app = express();


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use(express.json());
//app.use(express.urlencoded());
app.use(helmet());
app.disable('x-powered-by');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.COOKIE_KEY,
    name: 'sessionId',
    cookie: { maxAge: 900000 }
})
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes)


module.exports = app;

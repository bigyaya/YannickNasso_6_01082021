const express = require('express');
const mongoose = require('mongoose');

// donne accès au chemin de notre système de fichier
const path = require('path');

//protège l'application de certaines vulnérabilités connues ( protection contre les attaques de type cross-site scripting et autres injections )
//securise Express en définissant certaines en-têtes HTTP
const helmet = require('helmet');

//stocke les données de session sur le serveur ; il ne sauvegarde que l’ID session dans le cookie
const session = require('express-session');

//environement de configuration pour données sensibles
require('dotenv').config()


//-----------importation des routes-----------------//
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

//débloque certains systèmes de sécurité CORS
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


//les routes attendu par le frontend
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes)


module.exports = app;

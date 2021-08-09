const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');


exports.signup = (req, res, next) => {
    //crypt le mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //crée un nouveau user et mot de passe crypter
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //enregistre l'utilisateur dans la BdD
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};





exports.login = (req, res, next) => {
    //récuperer le user qui correspond à l'adresse mail entré
    User.findOne({ email: req.body.email })
        .then(user => {
            //s'il n'y a pas de user on renvoie une erreur
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
        //compare le mot de passe avec le hash de la BdD
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //si la comparaison est bonne on renvoie son user_Id et un token
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_KEY',
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};










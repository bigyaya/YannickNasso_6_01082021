// On importe bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require('bcrypt');

// On importe jsonwebtoken pour créer et vérifier un token pour un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');

// On récupère notre model User
const User = require('../models/users');

// On appel l'environement de variable
require('dotenv').config()




exports.signup = (req, res, next) => {

    //crypt le mot de passe grace à bcrypt avec la méthode hash(), le salte (10) ce sera le nombre de tours qu'on fait faire à l'algorithme. Plus la valeur est élevée, plus l'exécution de la fonction sera longue, et plus le hachage sera sécurisé
    bcrypt.hash(req.body.password, 10)

        // On récupère le hash de mdp qu'on va enregister en tant que nouvel utilisateur dans la BBD mongoDB
        .then(hash => {

            //crée un nouveau user et mot de passe crypter
            const user = new User({
                email: req.body.email, // On passe l'email qu'on trouve dans le corps de la requête
                password: hash  // On récupère le mdp hashé de bcrypt
            });

            //enregistre l'utilisateur dans la BdD
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))//HTTP 201 Created, indique que la requête a réussi et qu'une ressource a été créée et cette nouvelle ressource est renvoyée dans le corps du message
                .catch(error => res.status(400).json({ error }));//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
        })
        .catch(error => res.status(500).json({ error }));//HTTP 500 Internal Server Error, indique que le serveur a rencontré un problème inattendu qui l'empêche de répondre à la requête
};



/* Middleware pour la connexion d'un utilisateur.
Vérifie si l'utilisateur existe dans la base MongoDB lors du login
si oui il vérifie son mot de passe; 
s'il est bon il renvoie un TOKEN contenant l'id de l'utilisateur, 
sinon il renvoie une erreur */

exports.login = (req, res, next) => {

    //récuperer le user dans la BDD qui correspond à l'adresse mail entrée par l'utilisateur
    User.findOne({ email: req.body.email })
        .then(user => {
            //s'il n'y a pas de user on renvoie une erreur 401: non autorisé
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });//HTTP 401 Unauthorized, indique que la requête n'a pas été effectuée car il manque des informations d'authentification valides pour la ressource visée
            }

            //compare le mot de passe entrée par l'utilisateur avec le hash de la BDD et savoir si ils ont la même string d'origine grâce à bcrypt
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {

                    // Si false, c'est que ce n'est pas le bon utilisateur, ou le mot de passe est incorrect
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });//HTTP 401 Unauthorized, indique que la requête n'a pas été effectuée car il manque des informations d'authentification valides pour la ressource visée
                    }

                    //si la comparaison est bonne on renvoie son user_Id et un token
                    res.status(200).json({// Le serveur backend renvoie un token au frontend
                        userId: user._id,

                        /* envoie une requête authentifié au frontend,
                        on encode le userId pour éviter qu'un objet soit modifier par un autre userId 
                        et que l'objet soit assigner qu'a cet userId */
                        
                        token: jwt.sign(//les données que l'on veut encoder dans le Token =  Payload
                            {userId: user._id},//renvoie l'identifiant de l'utilisateur dans MongoDB
                            
                            process.env.TOKEN_KEY,// Clé du token crypter, pour sécuriser l'encodage
                            {expiresIn: '24h'}//argument de configuration
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));//HTTP 500 Internal Server Error, indique que le serveur a rencontré un problème inattendu qui l'empêche de répondre à la requête
        })
        .catch(error => res.status(500).json({ error }));//HTTP 500 Internal Server Error, indique que le serveur a rencontré un problème inattendu qui l'empêche de répondre à la requête
};










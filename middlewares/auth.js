const jwt = require('jsonwebtoken');
require('dotenv').config()


/*  -verifie le token envoyer par l'application frontend avec sa requête
    -vérifie si le token est valable
    -vérifier que c'est le userId encoder dans le token*/
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];//récupère le Token dans le header authorisation avec la methode split() (on récupère le 2ème élément après l'espace)
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);//décode le token et vérifie le token + la clé secrète créee lors de la création du token et sécuriser dans .env 
        const userId = decodedToken.userId;//récupère l'userId dans le token 

        /* On vérifie si le userID de la requête correspond à celui du token  */
        //si ce n'est pas le cas on renvoie une erreur
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
            //si tout va bien on envoie la requête au prochain middleware
            next();
        }
    } catch {
        res.status(401).json({
            error: error | 'Requête non authentifié !'
        });
    }
};
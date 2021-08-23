const Sauce = require('../models/sauces');
const fs = require('fs');

/**
 * AFFICHER TOUTES LES SAUCES
 */
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))//HTTP 200 OK, indique la réussite d'une requête
        .catch(error => res.status(400).json({ error }));//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
};

/**
 * AFFICHER UNE SEULE SAUCE
 */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))//HTTP 200 OK, indique la réussite d'une requête
        .catch(error => res.status(404).json({ error }));// HTTP 404 Not Found, indique que le serveur ne peut pas trouver la ressource demandée
};

/**
 * CRÉER UNE SAUCE
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))//HTTP 201 Created, indique que la requête a réussi et qu'une ressource a été créée et cette nouvelle ressource est renvoyée dans le corps du message
        .catch(error => {
            console.log(json({ error }));
            res.status(400).json({ error });//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
        });
};

/**
 * MODIFIER UNE SAUCE
 */
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        // si l'image est modifiée, il faut supprimer l'ancienne image dans le dossier /image
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // une fois que l'ancienne image est supprimée dans le dossier /image, on peut mettre à jour le reste
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))//HTTP 200 OK, indique la réussite d'une requête
                        .catch(error => res.status(400).json({ error }));//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        // si l'image n'est pas modifiée
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))//HTTP 200 OK, indique la réussite d'une requête
            .catch(error => res.status(400).json({ error }));//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
    }
};

/**
 * SUPPRIMER UNE SAUCE
 */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))//HTTP 200 OK, indique la réussite d'une requête
                    .catch(error => res.status(400).json({ error }));//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
            })
        })
        .catch(error => res.status(500).json({ error }));//HTTP 500 Internal Server Error, indique que le serveur a rencontré un problème inattendu qui l'empêche de répondre à la requête
};

/**
 * LIKE / DISLIKE UNE SAUCE
 */
exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            // nouvelles valeurs à modifier
            const newValues = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            // Différents cas:
            switch (like) {
                case 1:  // CAS: sauce liked
                    newValues.usersLiked.push(userId);
                    break;
                case -1:  // CAS: sauce disliked
                    newValues.usersDisliked.push(userId);
                    break;
                case 0:  // CAS: Annulation du like/dislike
                    if (newValues.usersLiked.includes(userId)) {
                        // si on annule le like
                        const index = newValues.usersLiked.indexOf(userId);
                        newValues.usersLiked.splice(index, 1);
                    } else {
                        // si on annule le dislike
                        const index = newValues.usersDisliked.indexOf(userId);
                        newValues.usersDisliked.splice(index, 1);
                    }
                    break;
            };
            // Calcul du nombre de likes / dislikes
            newValues.likes = newValues.usersLiked.length;
            newValues.dislikes = newValues.usersDisliked.length;
            // Mise à jour de la sauce avec les nouvelles valeurs
            Sauce.updateOne({ _id: sauceId }, newValues)
                .then(() => res.status(200).json({ message: 'Sauce notée !' }))//HTTP 200 OK, indique la réussite d'une requête
                .catch(error => res.status(400).json({ error }))//HTTP 400 Bad Request, indique que le serveur ne peut pas comprendre la requête en raison d'une syntaxe invalide
        })
        .catch(error => res.status(500).json({ error }));//HTTP 500 Internal Server Error, indique que le serveur a rencontré un problème inattendu qui l'empêche de répondre à la requête
}
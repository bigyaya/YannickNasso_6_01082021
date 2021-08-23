const passwordValidator = require('password-validator');

// Créer un schéma de mot de passe 
const passwordSchema = new passwordValidator();

// Contraintes du mot de passe
passwordSchema
    .is().min(8)                                    // Longueur minimun : 8
    .has().uppercase()                              // Doit avoir au moins une majuscule
    .has().lowercase()                              // Doit avoir au moins une minuscule
    .has().digits(2)                                 // Doit avoir au moins deux chiffres
    .has().symbols()                                // Doit avoir au moins un symbole
    .has().not().spaces()                           // Ne doit pas avoir d'espaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // valeurs à proscrire

module.exports = passwordSchema;
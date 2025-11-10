const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Le pseudo est requis'],
        unique: true,
        trim: true,
        minlength: [2, 'Le pseudo doit contenir au moins 2 caractères'],
        maxlength: [20, 'Le pseudo ne peut pas dépasser 20 caractères']
    },
    userId: {
        type: String,
        unique: true,
        required: true
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Méthode pour retourner l'utilisateur en JSON
userSchema.methods.toJSON = function () {
    return this.toObject();
};

module.exports = mongoose.model('User', userSchema);
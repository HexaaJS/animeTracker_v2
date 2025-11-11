const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Le pseudo est requis'],
        unique: true,
        trim: true,
        minlength: [2, 'Le pseudo doit contenir au moins 2 caractères'],
        maxlength: [20, 'Le pseudo ne peut pas dépasser 20 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
    userId: {
        type: String,
        unique: true,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    selectedTheme: {
        type: String,
        default: 'purpleDream'
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumUnlockedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour retourner l'utilisateur en JSON (sans le password)
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
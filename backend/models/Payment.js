const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    stripeSessionId: {
        type: String,
        required: true,
        unique: true
    },
    stripePaymentIntentId: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'eur'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    productType: {
        type: String,
        default: 'premium_themes'
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
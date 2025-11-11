const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');


const PREMIUM_PRICE = 499;

// Créer une session de paiement Stripe
const createCheckoutSession = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Le pseudo est requis'
            });
        }

        // Vérifier que l'utilisateur existe
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier s'il est déjà premium
        if (user.isPremium) {
            return res.status(400).json({
                success: false,
                message: 'Vous êtes déjà Premium !'
            });
        }

        // Créer la session Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Premium Themes Pack',
                            description: 'Débloquez 20+ thèmes exclusifs à vie',
                        },
                        unit_amount: PREMIUM_PRICE,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile?payment=cancelled`,
            client_reference_id: user._id.toString(),
            metadata: {
                username: user.username,
                userId: user._id.toString(),
                productType: 'premium_themes'
            }
        });

        // Enregistrer le paiement en attente
        await Payment.create({
            userId: user._id,
            username: user.username,
            stripeSessionId: session.id,
            amount: PREMIUM_PRICE,
            currency: 'eur',
            status: 'pending',
            productType: 'premium_themes'
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Erreur Stripe Checkout:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création de la session de paiement'
        });
    }
};

// Webhook Stripe pour confirmer le paiement
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Vérifier la signature du webhook
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Erreur webhook signature:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer les événements Stripe
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent succeeded:', paymentIntent.id);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handleFailedPayment(failedPayment);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

// Traiter un paiement réussi
const handleSuccessfulPayment = async (session) => {
    try {
        const userId = session.client_reference_id;
        const username = session.metadata.username;

        // Mettre à jour l'utilisateur en Premium
        const user = await User.findById(userId);
        if (user) {
            user.isPremium = true;
            user.premiumUnlockedAt = new Date();
            await user.save();
        }

        // Mettre à jour le paiement
        await Payment.findOneAndUpdate(
            { stripeSessionId: session.id },
            {
                status: 'completed',
                stripePaymentIntentId: session.payment_intent
            }
        );

        console.log(`✅ Premium activé pour ${username} (${userId})`);
    } catch (error) {
        console.error('Erreur lors de l\'activation Premium:', error);
    }
};

// Traiter un paiement échoué
const handleFailedPayment = async (paymentIntent) => {
    try {
        await Payment.findOneAndUpdate(
            { stripePaymentIntentId: paymentIntent.id },
            { status: 'failed' }
        );
        console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Erreur lors de la gestion du paiement échoué:', error);
    }
};

// Vérifier le statut d'un paiement
const checkPaymentStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const payment = await Payment.findOne({ stripeSessionId: sessionId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Paiement non trouvé'
            });
        }

        res.json({
            success: true,
            data: {
                status: payment.status,
                amount: payment.amount,
                createdAt: payment.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    checkPaymentStatus
};
import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private stripe : Stripe;

    constructor(){
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        
        this.stripe = new Stripe(stripeSecretKey);
    }

    async createPaymentIntent(amount : number, orderId : number){
    return this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'inr',
        metadata:{
            orderId : orderId.toString()
        }
    })
    }

    constructWebhookEvent(body: any, signature: string, webhookSecret: string) {
        return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }

    async retrievePaymentIntent(paymentIntentId: string) {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }

}
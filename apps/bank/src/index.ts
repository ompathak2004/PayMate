import express from "express";
import {prisma} from "@repo/db/client";
const app = express();

app.post("/hdfcWebhook",async (req, res) => {
    //TODO: Add zod validation here?
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
    try{
        await prisma.$transaction([
             prisma.balance.update({
                where:{
                    userId: paymentInformation.userId
                },
                data:{
                    amount:{
                        increment : paymentInformation.amount
                    }
                }
            }),
            prisma.onRampTransaction.update({
                where:{
                    token: paymentInformation.token
                },
                data:{
                    status: "Success"
                }
            })
        ]);
        res.status(200).json({
            message:"captured"
        })

    }catch(e){
        console.error(e);
        res.status(500).json({
            message:"Erroe while processing"
        })
    }
})
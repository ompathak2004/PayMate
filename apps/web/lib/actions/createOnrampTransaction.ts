"use server"
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function createOnrampTransaction(provider: string, amount:number){
    const session = await getServerSession(authOptions);

    if(!session?.user || !session?.user?.id){
        return {
            message:"Unauthorized",
        }
    }

    const token = (Math.random()*1000).toString(); 
    await prisma.onRampTransaction.create({
        data:{
            provider,
            status : "Processing",
            amount : amount,
            startTime :new Date(),
            token,
            transactionType : "Deposit",
            userId : session.user.id
        }
    })
}
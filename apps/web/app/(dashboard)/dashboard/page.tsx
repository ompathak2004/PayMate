import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db/client";
import { Card } from "@repo/ui/card";
import { BalanceCard } from "../../../components/BalanceCard";

async function getData() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return null;
    }

    const userId = parseInt(session.user.id);
    
    const [balance, onRampTxns, p2pTxns] = await Promise.all([
        prisma.balance.findUnique({
            where: { userId }
        }),
        prisma.onRampTransaction.findMany({
            where: { userId },
            take: 5,
            orderBy: { startTime: 'desc' }
        }),
        prisma.p2pTransfer.findMany({
            where: { 
                OR: [
                    { fromUserId: userId },
                    { toUserId: userId }
                ]
            },
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: {
                fromUser: true,
                toUser: true
            }
        })
    ]);

    return {
        name: session.user.name,
        balance,
        onRampTxns,
        p2pTxns
    };
}

export default async function Dashboard() {
    const data = await getData();

    if (!data) {
        return <div>Please login to continue</div>;
    }

    return (
        <div className="p-8 w-full">
            <div className="text-4xl font-bold text-[#6a51a6] mb-8">
                Hello, {data.name || "User"}
            </div>

            <div className="mb-8">
                <BalanceCard 
                    amount={data.balance?.amount || 0} 
                    locked={data.balance?.locked || 0} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Recent Deposits">
                    <div className="p-4">
                        {data.onRampTxns.length > 0 ? (
                            data.onRampTxns.map(txn => (
                                <div key={txn.id} className="flex justify-between py-2 border-b">
                                    <div>
                                        <div className="text-sm">{txn.provider}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(txn.startTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={`${txn.status === 'Success' ? 'text-green-600' : 'text-orange-600'}`}>
                                        ₹{txn.amount / 100}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No recent deposits
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Recent Transfers">
                    <div className="p-4">
                        {data.p2pTxns.length > 0 ? (
                            data.p2pTxns.map(txn => (
                                <div key={txn.id} className="flex justify-between py-2 border-b">
                                    <div>
                                        <div className="text-sm">
                                            {txn.fromUserId === parseInt(data.name) ? 
                                                `To: ${txn.toUser.name || txn.toUser.number}` :
                                                `From: ${txn.fromUser.name || txn.fromUser.number}`
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(txn.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={txn.fromUserId === parseInt(data.name) ? 
                                        'text-red-600' : 'text-green-600'}>
                                        {txn.fromUserId === parseInt(data.name) ? '-' : '+'}
                                        ₹{txn.amount / 100}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No recent transfers
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
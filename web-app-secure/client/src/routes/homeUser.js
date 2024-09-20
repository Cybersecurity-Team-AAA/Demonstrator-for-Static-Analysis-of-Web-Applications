import Footer from "../components/footer";
import HeaderUser from "../components/headerUser";
import Table from 'react-bootstrap/Table';
import { useEffect, useMemo, useState, useContext } from "react";
import { deleteUserTransaction, acceptUserTransaction, getOwnTransactions, generateTransactionsFile, getTransactionsFile } from "../api/transactions";
import { Button, Container, Stack } from "react-bootstrap";
import { UserContext } from '../App'
import CustomModal from "../components/modal";
import download from 'downloadjs'

function TransactionRow({ transaction, onTransactionAccept, onTransactionReject }) {

    if (transaction.pending_state === "false") {
        return <tr>
            <td>{transaction.seller_username}</td>
            <td>{transaction.amount}</td>
            <td>{transaction.timestamp}</td>
        </tr>
    }
    else {
        return <tr>
            <td>{transaction.seller_username}</td>
            <td>{transaction.amount}</td>
            <td>{transaction.timestamp}</td>
            <td>
                <Stack direction="horizontal" style={{ justifyContent: "center", gap: "5px" }} >
                    <Button variant="success" style={{ maxWidth: "fit-content" }} onClick={() => onTransactionAccept(transaction.id)}>Accept</Button>
                    <Button variant="danger" style={{ maxWidth: "fit-content" }} onClick={() => onTransactionReject(transaction.id)}>Reject</Button>
                </Stack>
            </td>
        </tr>
    }
}

// tabella di transazioni: seller, amount, timestamp
function TransactionTable({ isPending, transactions, onTransactionAccept, onTransactionReject }) {
    const [sellerFilter, setSellerFilter] = useState(null);
    const [amountFilter, setAmountFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);


    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions]
        if (sellerFilter !== null && !!sellerFilter) {
            filtered = filtered.filter((t) => t.seller_username.includes(sellerFilter))
        }
        if (amountFilter !== null && !!amountFilter) {
            filtered = filtered.filter((t) => t.amount === amountFilter)
        }
        if (dateFilter !== null && !!dateFilter) {
            filtered = filtered.filter((t) => t.timestamp.startsWith(dateFilter))
        }

        return filtered
    }, [sellerFilter, amountFilter, dateFilter, transactions])

    if (!transactions || transactions.length === 0) {
        return <p className="w-50 mx-auto mt-3 text-center"> No {isPending && "pending"} transactions {!isPending && "yet"}</p>
    }

    // if (!filteredTransactions || filteredTransactions.length === 0) {
    //     return <p className="w-50 mx-auto mt-3 text-center"> No {isPending && "pending"} transactions {!isPending && "found"}</p>
    // }

    return <>
        <Table striped bordered hover className="w-50 mx-auto mt-3">
            <thead>
                <tr style={{ textAlign: "center" }}>
                    <th>
                        <Stack>
                            <p>Seller</p>
                            <input placeholder="Seller filter" value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)} />
                        </Stack>
                    </th>
                    <th>
                        <Stack>
                            <p>Amount</p>
                            <input placeholder="Amount filter" value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)} />
                        </Stack>
                    </th>
                    <th>
                        <Stack>
                            <p>Date</p>
                            <input placeholder="Date filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                        </Stack>
                    </th>
                    {isPending && <th>Action</th>}
                </tr>
            </thead>
            <tbody>
                {filteredTransactions.map(t => <TransactionRow key={t.id} transaction={t} onTransactionAccept={onTransactionAccept} onTransactionReject={onTransactionReject} />)}
            </tbody>
        </Table>
    </>
}

function HomeUser() {
    const { user, updateBalance } = useContext(UserContext);
    const [transactions, setTransactions] = useState([]);
    const [ modal, setModal ] = useState({
        title: "Something went wrong",
        body: "",
        isOpen: false,
        buttons: ["Close"]
    })
    useEffect(() => {
        getOwnTransactions().then((value) => {
            setTransactions(value)
        })
            .catch((err) => {
                // console.error(err)
            })
    }, [])

    const pendingTransactions = useMemo(() => transactions.filter((t) => t.pending_state === "true"), [transactions]);
    const finalizedTransactions = useMemo(() => transactions.filter((t) => t.pending_state === "false"), [transactions])

    const onTransactionAccept = async (transactionId) => {
        try {
            const new_user = await acceptUserTransaction(transactionId);
            setTransactions((p) => p.map(it => it.id === transactionId ? { ...it, pending_state: "false" } : it))
            updateBalance(new_user.balance);
        } catch (err) {
            // console.error(err)
            if (err.message) {
                setModal((it) => ({
                    ...it,
                    body: err.message,
                    isOpen: true
                }))
            }
        }
    }

    const onTransactionReject = async (transactionId) => {
        await deleteUserTransaction(transactionId);
        setTransactions((p) => p.filter((it) => it.id !== transactionId))
    }

    const handleDownload = () => {
        generateTransactionsFile()
        .then(() => {
            getTransactionsFile()
            .then(res => res.blob())
                .then(blob => download(blob, "transactions_list", "text/plain")) 
            .catch(() => {
                setModal((it) => ({
                    ...it,
                    body: "Error!",
                    isOpen: true
                }));
            })
        })
        .catch(() => {
            setModal((it) => ({
                ...it,
                body: "Error!",
                isOpen: true
            }));
        }); 
    }

    return (
        <>
            <HeaderUser />
            <div className="w-50 mx-auto mt-3 text-center"><h1>Current balance: EUR {user.balance}</h1></div>
            <TransactionTable isPending={true} transactions={pendingTransactions} onTransactionAccept={onTransactionAccept} onTransactionReject={onTransactionReject}></TransactionTable>
            <TransactionTable isPending={false} transactions={finalizedTransactions}></TransactionTable>
            <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                <Button className="ml-auto" onClick={handleDownload}> Download transaction list </Button>                
            </Container>
            <Footer />
            <CustomModal title={modal?.title} body={modal?.body} isOpen={modal?.isOpen ?? false} buttons={modal?.buttons ?? []} onClose={() => setModal((it) => ({ ...it, isOpen: false }))}></CustomModal>
        </>
    );
}
export default HomeUser;
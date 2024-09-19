import { Button, Table, Container, Row, Form, Col } from "react-bootstrap";
import Footer from "../components/footer";
import HeaderAdmin from "../components/headerAdmin";
import { useEffect, useState } from "react";
import CustomModal from "../components/modal";
import { addTransaction, deleteTransaction, getAllTransactions, modifyTransaction } from "../api/transactions";

function HomeAdmin(){

    const [tableData, setTableData] = useState([]);
    const [transactionIdMod, setTransactionIdMod] = useState();
    const [amountMod, setAmountMod] = useState();
    const [user, setNormalUser] = useState();
    const [seller, setSeller] = useState();
    const [amount, setAmount] = useState();
    const [showPopup, setShowPopup] = useState(null);

    const createTable = () => {
        getAllTransactions()
        .then((res) => {
            res.json().then((response) => {
                setTableData([]);
                for(let i = 0; i < response.length; i++) {
                    const data = {
                        id: response[i].id,
                        user_username: response[i].user_username,
                        seller_username: response[i].seller_username,
                        amount: response[i].amount,
                        timestamp: response[i].timestamp,
                    }
                    setTableData((tableData => [...tableData, data]));
            }});
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    const updateTable = () => {
        createTable();  // this will also catch err and show err popup if err occurs
        setShowPopup("upd");
    }

    const removeTransaction = (transactionId) => {
        deleteTransaction(transactionId)
        .then(() => {
            updateTable()
            setShowPopup("del");
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    const insertTransaction = (e) => {
        e.preventDefault();
        addTransaction(seller, user, amount)
        .then(() => {
            updateTable();
            setShowPopup("add");
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    const editTransaction = (e) => {
        e.preventDefault();
        modifyTransaction(transactionIdMod, amountMod)
        .then(() => {
            updateTable();
            setShowPopup("mod");
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    useEffect(() => {
        createTable();
    }, [])

    const handleModal = () => {
        setShowPopup(null)
    }

    const TransactionRow = (props) => {
        return(
            <>
                <tr>
                    <td>{props.transaction.id}</td>
                    <td>{props.transaction.seller_username}</td>
                    <td>{props.transaction.user_username}</td>
                    <td>{props.transaction.amount}</td>
                    <td>{props.transaction.timestamp}</td>
                    <td>
                        <Button className="mx-1" onClick={() => removeTransaction(props.transaction.id)} variant="danger">Delete</Button>
                    </td>
                </tr>
            </>
        );
    }

    return(
        <>
            <HeaderAdmin/>

            <Form className="fluid py-3 d-flex align-items-center justify-content-center" onSubmit={insertTransaction}>
                <Form.Label className="mx-3">Add Transaction: </Form.Label>
                <Row className="align-items-center">
                    <Col xs="auto">                  
                        <Form.Control className="mb-2" type="text" placeholder="Seller" value={seller} onChange={(e) => {setSeller(e.target.value)}}/>
                    </Col>
                    <Col xs="auto">
                        <Form.Control className="mb-2" type="text" placeholder="User" value={user} onChange={(e) => {setNormalUser(e.target.value)}}/>
                    </Col>
                    <Col xs="auto">
                        <Form.Control className="mb-2" type="number" min="0" placeholder="Amount" value={amount} onChange={(e) => {setAmount(e.target.value)}}/>
                    </Col>
        
                    <Col xs="auto">
                        <Button type="submit" className="mb-2" variant="success">Add</Button>
                    </Col>
                </Row>
            </Form>

            <Form className="fluid py-2 d-flex align-items-center justify-content-center" onSubmit={editTransaction}>
                <Form.Label className="mx-3">Modify Transaction: </Form.Label>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Form.Control className="mb-2" type="number" min="0" placeholder="Transaction ID" value={transactionIdMod} onChange={(e) => {setTransactionIdMod(e.target.value)}}/>
                    </Col>
                    <Col xs="auto">
                        <Form.Control className="mb-2" type="number" min="0" placeholder="Amount" value={amountMod} onChange={(e) => {setAmountMod(e.target.value)}}/>
                    </Col>
        
                    <Col xs="auto">
                        <Button type="submit" className="mb-2" variant="warning">Modify</Button>
                    </Col>
                </Row>
            </Form>

            <Col className="fluid py-3 d-flex align-items-center justify-content-center" xs="auto">
                <Button className="mb-2" onClick={updateTable} >Update table</Button>
            </Col>

            <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                <Table responsive striped bordered hover>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Seller ID</th>
                            <th>User ID</th>
                            <th>Amount</th>
                            <th>Timestamp</th>
                            <th>Tools</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction}/>)}
                    </tbody>
                </Table>
            </Container>

            <CustomModal
                isOpen={showPopup !== null} 
                title={showPopup === "add" ? "Transaction added" : (showPopup === "mod" ? "Transaction modified" : (showPopup === "del" ? "Transaction deleted" : (showPopup === "upd" ? "Transactions updated" : "Error!")))} 
                body={showPopup === "add" ? "You have successfully added the transaction" : (showPopup === "mod" ? "You have successfully modified a transaction " : (showPopup === "del" ? "You have successfully deleted a transaction" : (showPopup === "upd" ? "You have successfully updated the transactions list" : "Something went wrong")))} 
                buttons={["Close"]} onClose={handleModal} 
            />

            <Footer/>
        </>
    );
}
export default HomeAdmin;
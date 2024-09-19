import { Button, Table, Container, Col } from "react-bootstrap";
import Footer from "../components/footer";
import HeaderSeller from "../components/headerSeller";
import { useEffect, useState } from "react";
import CustomModal from "../components/modal";
import { getAllClosedTransactionsSeller } from "../api/transactions";

function TransactionsSeller(){

    const [tableData, setTableData] = useState([]);
    const [showPopup, setShowPopup] = useState(null);

    const createTable = () => {
        getAllClosedTransactionsSeller()
        .then((res) => {
            res.json().then((response) => {
                setTableData([]);
                for(let i = 0; i < response.length; i++) {
                    const data = {
                        id: response[i].id,
                        user_id: response[i].user_id,
                        seller_id: response[i].seller_id,
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

    useEffect(() => {
        createTable();
    }, [])

    const handleModal = () => {
        setShowPopup(null);
    }

    const TransactionRow = (props) => {
        return(
            <>
                <tr>
                    <td>{props.transaction.id}</td>
                    <td>{props.transaction.seller_id}</td>
                    <td>{props.transaction.user_id}</td>
                    <td>{props.transaction.amount}</td>
                    <td>{props.transaction.timestamp}</td>
                </tr>
            </>
        );
    }
    
    return(
        <>
            <HeaderSeller/>
            
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
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction}/>)}
                    </tbody>
                </Table>
            </Container>

            <CustomModal
                isOpen={showPopup !== null} 
                title={showPopup === "upd" ? "Transactions updated" : "Error!"} 
                body={showPopup === "upd" ? "You have successfully updated the transactions list" : "Something went wrong"} 
                buttons={["Close"]} onClose={handleModal} 
            />

            <Footer/>
        </>
    );
}
export default TransactionsSeller;
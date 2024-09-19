import { Button, Container, Form } from "react-bootstrap";
import Footer from "../components/footer";
import HeaderSeller from "../components/headerSeller";
import { useState } from "react";
import { rechargeWallet, requestPayment } from "../api/transactions";
import CustomModal from "../components/modal";
import {symmetricEncryption} from "../crypto";
import Cookies from 'js-cookie';

function HomeSeller(){

    const [usernameBuyer, setUsernameBuyer] = useState("");
    const [usernameToRecharge, setUsernameToRecharge] = useState("");
    const [amountPayment, setAmountPayment] = useState("");
    const [amountRecharge, setAmountRecharge] = useState("");
    const [showPopup, setShowPopup] = useState(null);

    const handleRequestPaymentSubmit = (e) => {
        e.preventDefault();
        requestPayment(usernameBuyer, amountPayment)
        .then(() => {
            setShowPopup("addtr");
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    const handleRechargeUserSubmit = (e) => {
        e.preventDefault();
        rechargeWallet(symmetricEncryption("rechargeUsWallet".concat(",", usernameToRecharge, ",", amountRecharge), Cookies.get("passwordHash")))   // it's the pwdHash of seller of course
        .then(() => {
            setShowPopup("addre");
        })
        .catch(() => {
            setShowPopup("err");
        });
    }

    const handleModal = () => {
        setShowPopup(null);
    }

    return(
        <>
            <HeaderSeller/>  
            
            <Container className="fluid py-5 d-flex align-items-center justify-content-center">
                <Form onSubmit={handleRequestPaymentSubmit} className="mx-5">
                    <div className="text-center">REQUEST A PAYMENT TO A USER</div>
                    <Form.Group className="mb-3 my-4">
                        <Form.Control type="text" placeholder="Username" value={usernameBuyer} onChange={e => { setUsernameBuyer(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control type="number" placeholder="Amount" value={amountPayment} min={0} step="0.01" onChange={e => { setAmountPayment(e.target.value) }} />
                    </Form.Group>
                    <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                        <Button variant="primary" type="submit"> Submit </Button>
                    </Container>
                </Form>

                <Form onSubmit={handleRechargeUserSubmit} className="mx-5">
                    <div className="text-center">RECHARGE A USER WALLET</div>
                    <Form.Group className="mb-3 my-4">
                        <Form.Control type="text" placeholder="Username" value={usernameToRecharge} onChange={e => { setUsernameToRecharge(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control type="number" placeholder="Amount" value={amountRecharge} min={0} step="0.01" onChange={e => { setAmountRecharge(e.target.value) }} />
                    </Form.Group>
                    <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                        <Button variant="primary" type="submit"> Submit </Button>
                    </Container>
                </Form>

            </Container>

            <CustomModal
                isOpen={showPopup !== null} 
                title={showPopup === "addtr" ? "Transactions added" : (showPopup === "addre" ? "Wallet recharged" : "Error!")} 
                body={showPopup === "addtr" ? "You have successfully added the transaction" : (showPopup === "addre" ? "You have successfully recharged user's wallet" : "Something went wrong")} 
                buttons={["Close"]} onClose={handleModal} 
            />

            <Footer/>
        </>
    );
}

export default HomeSeller;
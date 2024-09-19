import { useEffect, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Header from "../components/header"
import Footer from "../components/footer";
import Container from "react-bootstrap/Container";
import CustomModal from "../components/modal";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUserById } from "../api/authentication";

function EditUserProfile() {
    let { userId } = useParams();
    const [initialUsername, setInitialUsername] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [showPopup, setShowPopup] = useState(null);

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const pwd = isPasswordRequired ? password : null;
            await updateUserById(userId, username, pwd);
            setShowPopup("ok");
        }
        catch (exc) {
            if (exc.status === 401) setShowPopup("unauth");
            else setShowPopup("crit");
        }
    };

    useEffect(() => {
        const a = async () => {
            try {
                const res = await getUserById(userId);
                setInitialUsername(res.username);
                setUsername(res.username);
            } catch (exc) {
                if (exc.status === 404) setShowPopup("notfound");
                else if (exc.status === 401) setShowPopup("unauth");

                console.error("fetching user error", exc);
            }
            finally {
                setLoaded(true);
            }
        }
        a()
    }, [userId])

    const handleModal = (button) => {
        setShowPopup(null)
        if (button === "Home") navigate("/")
    }

    const isPasswordRequired = useMemo(() => (password.length > 0 || confirmPassword.length > 0), [password, confirmPassword])
    const arePasswordsEqual = useMemo(() => (password === confirmPassword), [password, confirmPassword])
    const arePasswordInserted = useMemo(() => (password.length > 0 && confirmPassword.length > 0), [password, confirmPassword])

    const isFormDisabled = useMemo(() => (((username === initialUsername && !isPasswordRequired) || (isPasswordRequired && (!arePasswordInserted || !arePasswordsEqual)))), [username, initialUsername, isPasswordRequired, arePasswordInserted, arePasswordsEqual])

    const modalObj = useMemo(() => {
        if (showPopup === "ok") return { title: "Edited succesfully", body: "You have successfully updated your profile", buttons: ["Home"] }
        if (showPopup === "crit") return { title: "Edit failed", body: "Something went wrong", buttons: ["Close"] }
        if (showPopup === "unauth") return { title: "Unauthorized", body: "You are not authorized to perform this action", buttons: ["Close"] }
        if (showPopup === "notfound") return { title: "Not found", body: "The user you are trying to edit does not exist", buttons: ["Close"] }
        else return { title: "", body: "", buttons: [] }
    }, [showPopup])
    if (!loaded) return <></>

    return (
        <>
            <Header />
            <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                <Form onSubmit={handleSubmit}>
                    <h2 className="text-center">Edit <span className="text-muted">{initialUsername}</span> profile</h2>
                    <Form.Group className="mb-3 my-4">
                        <Form.Label>Username*</Form.Label>
                        <Form.Control type="text" placeholder="Username" required value={username} onChange={e => { setUsername(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3 my-2">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" required={isPasswordRequired} value={password} onChange={e => { setPassword(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm new password</Form.Label>
                        <Form.Control type="password" placeholder="Password" required={isPasswordRequired} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value) }} />
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100" disabled={isFormDisabled}>
                        {isFormDisabled ? "No changes" : "Save changes"}
                    </Button>
                </Form>
            </Container>

            <CustomModal
                isOpen={showPopup !== null}
                title={modalObj.title}
                body={modalObj.body}
                buttons={modalObj.buttons} onClose={handleModal}
            />
            <Footer />
        </>
    );
}

export default EditUserProfile;
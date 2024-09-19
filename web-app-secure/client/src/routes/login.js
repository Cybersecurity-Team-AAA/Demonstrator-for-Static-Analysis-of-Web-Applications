import { useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Header from "../components/header"
import Footer from "../components/footer";
import Container from "react-bootstrap/Container";
import { login } from "../api/authentication";
import { useNavigate } from "react-router-dom";
import Alert from 'react-bootstrap/Alert';
import { UserContext } from "../App";

function Login() {
    const {loginz:setUser}  = useContext(UserContext)   // ndr loginz is just a silly name to avoid the error of "setUser is not a function"... this is linked to App.js context value passing
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(null);
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        const valid = validateForm();
        if (valid) {
            login(username, password)   // login is a function from App.js
                .then((res) => {
                    // res will have also the cookie sent by backend and will be used by browser of course for next requests
                    res.json().then((jsonresponse) => { // jsonresponse contains "id", "username", "passwordHash", "balance", "role", "pending_registration"
                        setUser(jsonresponse); // even though not all are needed but we save all these in localStorage:
                        localStorage.setItem('user', JSON.stringify(jsonresponse)); // I set here the localStorage instead of setting in authentication.js otherwise I would consume twice the same thing and would get error
                        navigate("/" + jsonresponse.role + "/homepage");    // navigate is js, does not refresh page.
                    });
                })
                .catch((err) => {
                    setShowAlert("err");
                });
        } else {
            setShowAlert("wrong");
        }
    };

    const validateForm = () => {
        let valid = true;
        if (!validateUsername() || !validatePassword())
            valid = false;
        return valid;
    }

    const validatePassword = () => {
        if(password.length < 3){
            return false;
        }
        return true;
    }

    const validateUsername = () => {
        if(username.length <= 0){
            return false
        }
        return true;
    }

    return (
        <> 
            <Header />
            <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                <Form onSubmit={handleSubmit} className="">
                    <div className="text-center">LOGIN</div>
                    <Form.Group className="mb-3 my-4">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Username" value={username} onChange={e => { setUsername(e.target.value) }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value) }} />
                    </Form.Group>
                    {showAlert !== null && 
                    <Alert  variant={"danger"} onClose={() => setShowAlert(null)} dismissible>
                        Wrong username or password!
                    </Alert>
                    }

                    <Container className="fluid py-3 d-flex align-items-center justify-content-center">
                        <Button variant="primary" type="submit"> Submit </Button>
                    </Container>
                </Form>
            </Container>
            <Footer />
        </>
    );
}

export default Login;
import Header from "../components/header";
import Footer from "../components/footer";
import { Button, Container } from "react-bootstrap";
import { UserContext } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    if (user) {
        navigate("/" + user.role + "/homepage");
    }

    return (
        <>
            <Header />

            <Container className="fluid py-4 d-flex align-items-center justify-content-center">
                <Button className="ml-auto" variant="primary" href="/login">Login</Button>
            </Container>

            <Container className="fluid py-2 d-flex align-items-center justify-content-center">
                <Button className="ml-auto" variant="primary" href="/registration">Registration</Button>
            </Container>
            <Footer />
        </>
    );
}
export default Home;
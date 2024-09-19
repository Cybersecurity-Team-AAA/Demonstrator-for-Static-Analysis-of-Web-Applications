import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/authentication";
import { UserContext } from "../App";
import { useContext } from "react";

function HeaderUser() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout()
            .then(() => {
                navigate("/");
            })
            .catch(() => {
                alert("Error during logout");
            });
    }

    return (
        <>
            <Navbar expand="sm" bg="primary" variant="dark">
                <Container className='mx-0'>
                    <Navbar.Brand as={Link} to="/user/homepage">Homepage</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
                    <Navbar.Collapse>
                        <Nav>
                            <Nav.Link as={Link} to="/user/locator">Seller Locator</Nav.Link>
                            <Nav.Link as={Link} to="/user/changeTheme">Change Theme</Nav.Link>
                            <Nav.Link className="ml-auto" as={Link} to={`/account/${user.id}`}>Edit Account</Nav.Link>
                            <Button variant="danger" onClick={handleLogout}>Logout</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
export default HeaderUser;
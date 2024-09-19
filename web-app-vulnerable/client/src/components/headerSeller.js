import { Button, Container, Nav, Navbar} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/authentication";

function HeaderSeller(){
    
    const navigate = useNavigate()

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

    return(
        <>
            <Navbar expand="sm" bg="primary" variant="dark">
                <Container className='mx-0'>
                    <Navbar.Brand as={Link} to="/seller/homepage">Homepage</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
                    <Navbar.Collapse>
                        <Nav>
                            <Nav.Link as={Link} to="/seller/transactions">Transactions closed</Nav.Link> 
                            <Button className="ml-auto" variant="danger" onClick={handleLogout} >Logout</Button>
                        </Nav> 
                    </Navbar.Collapse>              
                </Container>
            </Navbar>
        </>
    );
}
export default HeaderSeller;
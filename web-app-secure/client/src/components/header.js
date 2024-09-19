import 'bootstrap/dist/css/bootstrap.min.css'
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header(){
    return(
        <>
            <Navbar expand="sm" bg="primary" variant="dark">
                <Container className='mx-0'>
                    <Navbar.Brand as={Link} to="/">Homepage</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
                </Container>
            </Navbar>            
        </>
    );
}

export default Header;
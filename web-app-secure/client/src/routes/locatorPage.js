import {useEffect, useState } from "react";
import { Button, Form, InputGroup, Table } from "react-bootstrap";
import { searchSellerByUsername } from "../api/transactions";
import Footer from "../components/footer";
import HeaderUser from "../components/headerUser";
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function LocatorPage() {
    const query = useQuery();
    const navigate = useNavigate();
    const { pathname } = useLocation(); 
    const [sellerUsername, setSellerUsername] = useState(query.get('sellerUsername') || '');
    const [sellersFound, setSellersFound] = useState([]);
    const [error, setError] = useState('');

    // useEffect per eseguire la ricerca iniziale se sellerUsername è presente nella query
    useEffect(() => {
        if (sellerUsername) {
            handleSearch(sellerUsername);
        }
    }, []); // Vuoto per eseguire solo una volta al caricamento del componente

    const handleSearch = async (usernameSellerToSearch) => {
        if (usernameSellerToSearch === "") return;
        try {
            const sellers = await searchSellerByUsername(usernameSellerToSearch);
            setSellersFound(sellers);
            setError('');
        } catch (exc) {
            console.error(exc);
            setError('Error, the regex may be invalid. If you are using a combined regex, put the single strings in quotes.');
        }
    };

    // Gestore del click del bottone di ricerca
    const handleSearchClick = () => {
        const params = new URLSearchParams({ sellerUsername });
        navigate(`${pathname}?${params.toString()}`);
        handleSearch(sellerUsername);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previene il comportamento predefinito di ricaricare la pagina
            handleSearchClick(); // Simula il click del pulsante di ricerca
        }
    };

    return (
        <>
            <HeaderUser />
            <h1 className="w-50 mx-auto text-center my-3">Seller's Locator</h1>
            <Form className="w-50 mx-auto mt-3">
                <Form.Group controlId="sellerUsername">
                    <Form.Label>Seller's Username</Form.Label>
                    <InputGroup>
                        <Form.Control 
                            placeholder="Enter seller's username"
                            aria-label="Seller's username"
                            value={sellerUsername}
                            onChange={(e) => setSellerUsername(e.target.value)}
                            onKeyDown={handleKeyDown} // Aggiunto il gestore dell'evento keydown
                            aria-describedby="usernameHelpBlock"
                            size="lg"
                        />
                        {/* Aggiunto il pulsante di ricerca */}
                        <Button variant="primary" onClick={handleSearchClick}>Search</Button>
                    </InputGroup>
                    <Form.Text id="usernameHelpBlock" muted>
                        You can also use a regex or a composition of regex combined via the + operator.
                    </Form.Text>
                </Form.Group>
            </Form>
            {error && (
                <div className="mt-3 text-center">
                    <p className="text-danger">{error}</p>  
                </div>
            )}
            {!error && sellerUsername && (
                <div className="mt-3 text-center">
                    <p>You are searching for seller: <span>{sellerUsername}</span> </p>  
                </div>
            )}
            <Table hidden={sellersFound.length === 0} striped bordered hover className="w-50 mx-auto mt-3">
                <thead>
                    <tr>
                        <th>Seller Name</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {sellersFound.map((s) => (
                        <tr key={s.username}>
                            <td>{s.username}</td>
                            <td>{s.address || "No Address Available"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Footer />
        </>
    );
}
import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Footer from "../components/footer";
import HeaderUser from "../components/headerUser";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ChangeTheme() {
    const query = useQuery();
    const themeChosen = query.get('color') || 'white';
    const textColor = ['white', 'pink'].includes(themeChosen) ? 'black' : 'white';
    const { setTheme } = useContext(UserContext);
    const navigate = useNavigate();
    const { pathname } = useLocation(); 
  
    useEffect(() => {
      setTheme(themeChosen);
      const params = new URLSearchParams({ color: themeChosen });
      navigate(`${pathname}?${params.toString()}`, { replace: true });
    }, [themeChosen, navigate, pathname, setTheme]);
  
    return (
        <>
        <HeaderUser />
            <div style={{
                backgroundColor: themeChosen,
                color: textColor,
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
                }}>
                <h1>Welcome to Theme Customizer</h1>
                <select
                    value={themeChosen}
                    onChange={e => navigate(`?color=${e.target.value}`, { replace: true })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                >
                    <option value="white">White</option>
                    <option value="pink">Pink</option>
                    <option value="orange">Orange</option>
                    <option value="grey">Grey</option>
                </select>
                <p style={{ marginTop: '20px' }}>You selected: <strong dangerouslySetInnerHTML={{__html:themeChosen}}></strong></p>
            </div>
        <Footer />
        </>
    );
  }
  
  export default ChangeTheme;
  


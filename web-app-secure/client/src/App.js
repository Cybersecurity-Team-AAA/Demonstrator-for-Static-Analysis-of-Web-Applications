import React from "react";
import {useState, createContext, useEffect} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./routes/home"
import HomeUser from "./routes/homeUser";
import HomeAdmin from "./routes/homeAdmin";
import HomeSeller from "./routes/homeSeller";
import Registration from "./routes/registration";
import Login from "./routes/login";
import PrivateRoute from "./components/privateRoute";
import SellerRegistration from "./routes/sellerRegistration";
import TransactionsSeller from "./routes/transactionsSeller";
import LocatorPage from "./routes/locatorPage";
import ChangeTheme from "./routes/changeTheme";
import EditUserProfile from "./routes/editUserProfile";

export const UserContext = createContext(null);	

function App() {

	const [user, setUser] = useState(null); // even not all are needed, but will contain "id", "username", "passwordHash", "balance", "role", "pending_registration"
	
	const [role, setRole] = useState('');
	const updateBalance = (balance) => setUser((user) => ({...user, balance}));

	const [theme, setTheme] = useState('white');

	useEffect(() => {
		if (user) {
		  setRole(user.role);
		}
	  }, [user]);

	useEffect(() => {
		const savedUser = localStorage.getItem('user');
		if (savedUser) {
		  setUser(JSON.parse(savedUser));
		  
		}
	  }, []);

	useEffect(() => {
		document.body.style.background = theme;
	}, [theme]);


	return (
		<div className="App">
			{/* ndr login:setUser is to put a silly name for setUser... otherwise in login.js will say setUser is not a function */}
			<UserContext.Provider value={{user, loginz:setUser, updateBalance, setTheme}}>
			{/* it is to give these values to all the child components without the need to explicitly send via prop */}
				
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home/>}></Route>				
						<Route path="/registration" element={<Registration/>}></Route>
						<Route path="/login" element={<Login />}></Route>        
						<Route path="/account/:userId" element={<EditUserProfile />}/>

						<Route element={<PrivateRoute role={role} accessible={"user"}/>}> 
							<Route path="/user/homepage" element={<HomeUser/>} />
							<Route path="/user/locator" element={<LocatorPage />} />
							<Route path="/user/changeTheme" element={<ChangeTheme />} />
						</Route>

						<Route element={<PrivateRoute role={role} accessible={"seller"}/>}> 
							<Route path="/seller/homepage" element={<HomeSeller/>} />
							<Route path="/seller/transactions" element={<TransactionsSeller/>} />
						</Route>

						<Route element={<PrivateRoute role={role} accessible={"admin"}/>}> 
							<Route path="/admin/homepage" element={<HomeAdmin/>}/>
							<Route path="/admin/sellerRegistration" element={<SellerRegistration/>}/>
						</Route>				
					</Routes>
				</BrowserRouter>
			</UserContext.Provider>
		</div>
	);
}

export default App;

import Login from "./Pages/LoginPage/Login";

function Router() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/inscription" element={<Inscription />} />
        </Routes>
    );
}

export default Router;
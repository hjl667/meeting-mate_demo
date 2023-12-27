import Navbar from "./Navbar"
import Analytics from "./pages/Analytics"
import Home from "./pages/Home"
import Calendar from "./pages/Calendar"
import { Route, Routes } from "react-router-dom"

function App() {
    return (
        <>
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<Calendar />} />
                </Routes>
            </div>
        </>
    )
}

export default App



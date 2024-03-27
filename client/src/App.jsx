import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Signup } from "./pages";
import Home from "./pages/Home";

function App() {
  return (
    <>
    <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
    </div>
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FormPage } from "./pages/FormPage";
import { SignPage } from "./pages/SignPage";
import { SuccessPage } from "./pages/SuccessPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<FormPage />} />
          <Route path="/sign/:token" element={<SignPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

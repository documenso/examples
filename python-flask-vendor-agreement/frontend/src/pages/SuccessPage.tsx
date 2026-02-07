import { useNavigate } from "react-router-dom";
import { SuccessView } from "../components/SuccessView";

export function SuccessPage() {
  const navigate = useNavigate();

  const handleReset = () => {
    navigate("/");
  };

  return <SuccessView onReset={handleReset} />;
}

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../../context/Wallet";
import { Button, Container } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TransferReceive = () => {
  const navigate = useNavigate();
  const { getLatestAddress } = useWallet();

  const { data: address, isLoading } = useQuery(["getLatestAddress"], {
    queryFn: async () => {
      const address = await getLatestAddress(false);
      console.log(address);
      return address;
    },
  });

  const goBack = () => {
    navigate("/");
  };
  return (
    <Container>
      <Button
        variant="outline-secondary mr-auto mb-5 d-flex align-items-center"
        onClick={goBack}
      >
        <FaArrowLeft className="mr-1" />
        <span className="mx-2">Back</span>
      </Button>
      <p className="mb-3">Receive Address:</p>
      <strong>{isLoading ? "Loading..." : address}</strong>
    </Container>
  );
};

export default TransferReceive;

import { Container } from "react-bootstrap";
import { useBlockbook } from "../../context/Blockbook";

const Balance = () => {
  const { xpub } = useBlockbook();

  const balance = xpub ? parseFloat(xpub.balance) / Math.pow(10, 7) : undefined;

  return (
    <Container
      className="bg-dark d-flex rounded text-white"
      style={{ height: "6rem" }}
    >
      <h1 className="m-auto">
        {balance}
        SYS
      </h1>
    </Container>
  );
};

export default Balance;

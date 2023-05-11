import { Button, Container } from "react-bootstrap";
import { useTransport } from "../context/Transport";

const ConnectedCheck = () => {
  const { isConnected, checkConnection } = useTransport();

  if (isConnected) {
    return null;
  }

  return (
    <Container className="d-flex h-100">
      <Button
        size="lg"
        className="m-auto"
        onClick={() => {
          checkConnection();
        }}
      >
        Connect
      </Button>
    </Container>
  );
};

export default ConnectedCheck;

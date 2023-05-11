import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const HomeActionButtons = () => {
  const navigate = useNavigate();
  return (
    <Row className="my-2">
      <Col xs={6}>
        <Button
          className="w-100"
          variant="primary"
          size="lg"
          onClick={() => navigate("/send")}
        >
          Send
        </Button>
      </Col>
      <Col xs={6}>
        <Button
          className="w-100"
          variant="secondary"
          size="lg"
          onClick={() => navigate("/receive")}
        >
          Receive
        </Button>
      </Col>
    </Row>
  );
};

export default HomeActionButtons;

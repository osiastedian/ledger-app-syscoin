import { Row, Col, Button } from "react-bootstrap";

const HomeActionButtons = () => {
  return (
    <Row className="my-2">
      <Col xs={6}>
        <Button className="w-100" variant="primary" size="lg">
          Send
        </Button>
      </Col>
      <Col xs={6}>
        <Button className="w-100" variant="secondary" size="lg">
          Receive
        </Button>
      </Col>
    </Row>
  );
};

export default HomeActionButtons;

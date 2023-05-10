import { Button, Col, ListGroup, Row } from "react-bootstrap";
import { useWallet } from "../../context/Wallet";

const AddressList = () => {
  const { addresses, createAddress } = useWallet();

  return (
    <Row>
      <Button onClick={() => createAddress(false)}>Create New Address</Button>
      <p>Address List:</p>

      <Col xs={12}>
        <ListGroup className="overflow-auto" style={{ maxHeight: "240px" }}>
          {addresses.map((t) => (
            <ListGroup.Item key={t}>{t}</ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
    </Row>
  );
};

export default AddressList;

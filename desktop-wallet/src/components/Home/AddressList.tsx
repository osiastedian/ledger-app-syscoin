import { useEffect } from "react";
import { Button, Col, ListGroup, Row } from "react-bootstrap";
import { useBlockbook } from "../../context/Blockbook";

const AddressList = () => {
  const { xpub } = useBlockbook();

  if (!xpub) {
    return null;
  }

  const xpubReceiveAddress = xpub.tokens.filter(
    (t) => t.type === "XPUBAddress"
  );

  return (
    <Row>
      <Button>Create New Address</Button>
      <p>Address List:</p>

      <Col xs={12}>
        <ListGroup>
          {xpubReceiveAddress.map((t) => (
            <ListGroup.Item key={t.name}>{t.name}</ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
    </Row>
  );
};

export default AddressList;

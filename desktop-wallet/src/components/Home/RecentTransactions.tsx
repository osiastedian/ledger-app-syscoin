import { ListGroup, Row } from "react-bootstrap";
import { useBlockbook } from "../../context/Blockbook";

const HomeRecentTransactions = () => {
  const { xpub } = useBlockbook();
  return (
    <Row className="mb-3">
      <p className="border-top mt-2 my-2 py-2">Recent Transactions:</p>
      <ListGroup>
        {xpub &&
          xpub.txids.map((txId) => (
            <ListGroup.Item key={txId} className="text-truncate">
              {txId}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </Row>
  );
};

export default HomeRecentTransactions;

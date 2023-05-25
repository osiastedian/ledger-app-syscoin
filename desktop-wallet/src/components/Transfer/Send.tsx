import { useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useBlockbook } from "../../context/Blockbook";
import { toSatoshi, toBitcoin } from "satoshi-bitcoin";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";

const TransferSend = () => {
  const navigate = useNavigate();
  const { send, xpub, confirmTx } = useBlockbook();
  const balance = xpub ? toBitcoin(xpub.balance) : undefined;
  const recommendedFee = 0.00001;

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const {
    mutate,
    isLoading: isSending,
    isSuccess: isSent,
    data: sendData,
    reset,
  } = useMutation(["send"], send);

  const { data: isConfirmed } = useQuery(["confirm", "tx"], {
    queryFn: () => confirmTx(sendData),
    enabled: isSent,
  });

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    mutate({ toAddress, amount });
  };

  const inputsAllowed = !isSending;
  const isInvalidAmount =
    toSatoshi(amount) > toSatoshi(balance ?? 0) - toSatoshi(recommendedFee);

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
      {isSent && (
        <div>
          <a
            href={`https://blockbook.elint.services/tx/${sendData}`}
            target="_blank"
          >
            View transaction
          </a>
          <p>
            Transaction ID: {sendData} (
            {isConfirmed ? "Confirmed" : "Not confirmed"})
          </p>
          <Button
            onClick={() => {
              reset();
            }}
          >
            New Transaction
          </Button>
        </div>
      )}
      {!isSent && (
        <Form onSubmit={onSubmit}>
          <Form.Group>
            <Form.Label htmlFor="to">To</Form.Label>
            <Form.Control
              name="to"
              placeholder="sys1....."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={!inputsAllowed}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="amount">Amount</Form.Label>
            <InputGroup>
              <Form.Control
                name="amount"
                placeholder="1.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!inputsAllowed}
                isInvalid={isInvalidAmount}
              />
              <InputGroup.Text>SYS</InputGroup.Text>
            </InputGroup>
            <Form.Text>Balance: {balance} SYS</Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Label>Fees:</Form.Label>
            <Form.Text>{recommendedFee} SYS</Form.Text>
          </Form.Group>
          <Button type="submit" disabled={!inputsAllowed}>
            Send
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default TransferSend;

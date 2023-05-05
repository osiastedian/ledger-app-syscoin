import { useQuery } from "@tanstack/react-query";
import { useReducer, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useBlockbook } from "../../context/Blockbook";
import { toSatoshi, toBitcoin } from "satoshi-bitcoin";

type TransferState = {
  status:
    | "initialized"
    | "request-sign-psbt"
    | "sending-to-blockbook"
    | "confirmed-by-blockbook"
    | "done";
};

const initialState: TransferState = {
  status: "initialized",
};

type RequestSignatureAction = {
  method: "request-sign-psbt";
  payload: {
    to: string;
    amount: string;
  };
};

type SendToBlockbook = {
  method: "send-to-blockbook";
  payload: {
    data: Uint16Array;
  };
};

type Actions = RequestSignatureAction | SendToBlockbook;

const TransferSend = () => {
  const { sendAmount, xpub } = useBlockbook();
  const balance = xpub ? toBitcoin(xpub.balance) : undefined;
  const recommendedFee = 0.00001;
  const [currentState, dispatch] = useReducer(
    (state: TransferState, action: Actions) => {
      switch (action.method) {
        case "request-sign-psbt": {
          state.status = "request-sign-psbt";
          break;
        }
        case "send-to-blockbook": {
          state.status = "sending-to-blockbook";
          break;
        }
      }
      return state;
    },
    initialState
  );

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    sendAmount(toAddress, amount);
    dispatch({
      method: "request-sign-psbt",
      payload: {
        to: toAddress,
        amount,
      },
    });
  };

  const inputsAllowed = currentState.status === "initialized";
  const isInvalidAmount =
    toSatoshi(amount) > toSatoshi(balance ?? 0) - toSatoshi(recommendedFee);

  return (
    <Container>
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
    </Container>
  );
};

export default TransferSend;

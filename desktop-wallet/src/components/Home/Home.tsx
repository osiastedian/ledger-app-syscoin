import { Container } from "react-bootstrap";
import HomeActionButtons from "./ActionButtons";
import AddressList from "./AddressList";
import Balance from "./Balance";
import HomeRecentTransactions from "./RecentTransactions";

const HomePage = () => {
  return (
    <Container>
      <Balance />
      <HomeActionButtons />
      <HomeRecentTransactions />
      <AddressList />
    </Container>
  );
};

export default HomePage;

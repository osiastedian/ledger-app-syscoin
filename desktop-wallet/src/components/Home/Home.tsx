import { Container } from "react-bootstrap";
import HomeActionButtons from "./ActionButtons";
import Balance from "./Balance";
import HomeRecentTransactions from "./RecentTransactions";

const HomePage = () => {
  return (
    <Container>
      <Balance />
      <HomeActionButtons />
      <HomeRecentTransactions />
    </Container>
  );
};

export default HomePage;

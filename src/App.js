import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "./helper";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";

const PENDING_TO_PAY = {
  name: "Bug Bash",
  email: "bug_bash@example.com",
};

const PAID_VOUCHER = {
  name: "BugBash Paid",
  email: "bug_bash_succeed_immediately@example.com",
};

const EXPIRED_VOUCHER = {
  name: "BugBash Expired",
  email: "bug_bash_expire_immediately@example.com",
};

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY, {
  betas: ["oxxo_pm_beta_1"],
  apiVersion: "2020-03-02; oxxo_beta=v2",
});

export class OxxoDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clientSecret: "",
      oxxoDetails: "",
      error: "",
      hostedVoucherUrl: "",
    };
  }

  getOxxo = (input) => {
    const paymentIntentData = {
      amount: 2000,
      currency: "mxn",
      payment_method_types: ["oxxo"],
    };
    const { stripe } = this.props;

    return createPaymentIntent(paymentIntentData).then(({ object, error }) => {
      if (error) {
        this.setState({ error: error });
        return;
      }

      console.log(object);
      const { client_secret } = object;

      return stripe
        .confirmOxxoPayment(object.client_secret, {
          payment_method: {
            billing_details: {
              name: input.name,
              email: input.email,
            },
          },
        })
        .then((result) => {
          console.log(result);
          if (result.error) {
            this.setState({
              clientSecret: client_secret,
              error: result.error.message,
            });
          } else {
            this.setState({
              clientSecret: client_secret,
              oxxoDetails:
                result.paymentIntent.next_action.display_oxxo_details,
            });
          }
        });
    });
  };

  renderVoucherLinkAlert = () => {
    if (!this.state.oxxoDetails) {
      return null;
    }

    const { hosted_voucher_url } = this.state.oxxoDetails;

    return (
      <Alert variant="info">
        Open the voucher in a new tab:
        <Alert.Link href={hosted_voucher_url} target="_blank">
           hosted voucher link
        </Alert.Link>
      </Alert>
    );
  };

  render() {
    if (!this.props.stripe) {
      return <Alert variant="danger">stripe JS instance is not set up.</Alert>;
    }

    return (
      <div>
        <Container fluid>
          <Row>
            <Col>
              <h1 className="header">OXXO Bug Bash</h1>
            </Col>
          </Row>
        </Container>

        <Container>
          {this.renderVoucherLinkAlert()}
          <Card className="card-space">
            <Card.Header as="h5">Pending To Pay OXXO</Card.Header>
            <Card.Body>
              <Card.Text>
                <p>Name: {PENDING_TO_PAY.name}</p>
                <p className="ellipsis">Email: {PENDING_TO_PAY.email}</p>
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => this.getOxxo(PENDING_TO_PAY)}
              >
                Go somewhere
              </Button>
            </Card.Body>
          </Card>
          <Card className="card-space">
            <Card.Header as="h5">Paid OXXO</Card.Header>
            <Card.Body>
              <Card.Text>
                <p>Name: {PAID_VOUCHER.name}</p>
                <p className="ellipsis">Email: {PAID_VOUCHER.email}</p>
              </Card.Text>
              <Button
                onClick={() => this.getOxxo(PAID_VOUCHER)}
                variant="success"
              >
                Get Paid OXXO
              </Button>
            </Card.Body>
          </Card>
          <Card className="card-space">
            <Card.Header as="h5">Expired OXXO</Card.Header>
            <Card.Body>
              <Card.Text>
                <p>Name: {EXPIRED_VOUCHER.name}</p>
                <p className="ellipsis">Email: {EXPIRED_VOUCHER.email}</p>
              </Card.Text>
              <Button
                onClick={() => this.getOxxo(EXPIRED_VOUCHER)}
                variant="warning"
              >
                Get Expired OXXO
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }
}

const InjectedOxxoDemo = () => {
  return (
    <ElementsConsumer>
      {({ elements, stripe }) => (
        <OxxoDemo elements={elements} stripe={stripe} />
      )}
    </ElementsConsumer>
  );
};

export function App() {
  return (
    <Elements stripe={stripePromise}>
      <InjectedOxxoDemo />
    </Elements>
  );
}

export default App;

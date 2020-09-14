import React from "react";
import "./App.css";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";

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

  createPaymentIntent = async () => {
    const option = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    const res = await fetch("/payment-intent", option);
    const data = res.json();
    return data;
  };

  getPendingToPay = async () => {
    const { stripe } = this.props;

    const data = await this.createPaymentIntent();
    const result = await stripe.confirmOxxoPayment(data.client_secret, {
      payment_method: {
        billing_details: {
          name: "Bug Bash",
          email: "Bug@bash.com",
        },
      },
    });

    if (result.error) {
      this.setState({
        error: result.error.message,
        clientSecret: data.client_secret,
      });
    } else {
      this.setState({
        clientSecret: data.client_secret,
        oxxoDetails: result.paymentIntent.next_action.display_oxxo_details,
      });
    }
  };

  render() {
    // if (!this.props.stripe) {
    //   return <Alert message="stripe JS instance is not set up." type="error" />;
    // }

    return (
      <div className="App">
        <header className="App-header">OXXO Bug Bash</header>
        <button onClick={this.getPendingToPay}>Get Pending To Pay OXXO</button>
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

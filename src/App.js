import React from "react";
import "./App.css";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";

import { createPaymentIntent } from "./helper";

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

  getPendingToPay = () => {
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
              name: "Bug Bash",
              email: "Bug@bash.com",
            },
          },
        })
        .then((result) => {
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

const serialize = (object, scope) => {
  let result = [];
  Object.keys(object).forEach((key) => {
    const value = object[key];
    const scopedKey = scope ? `${scope}[${key}]` : key;
    if (value && typeof value === "object") {
      const nestedResult = serialize(value, scopedKey);
      if (nestedResult !== "") {
        result = [...result, nestedResult];
      }
    } else if (value !== undefined && value !== null) {
      result = [...result, `${scopedKey}=${encodeURIComponent(String(value))}`];
    }
  });
  return result.join("&").replace(/%20/g, "+");
};

const SECRET_KEY = process.env.REACT_APP_STRIPE_SECRET_KEY;

export const createPaymentIntent = (body) => {
  return fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      betas: ["oxxo_pm_beta_1"],
      apiVersion: "2020-03-02; oxxo_beta=v3",
    },
    body: body ? serialize(body) : undefined,
  })
  .then(res => res.json())
  .then(data => {
    if (!data || data.error) {
      console.log("[tents] API error:", { data });
      return {
        error: {
          message: "API Error, check console for more info...",
        },
      };
    } else {
      return { object: data };
    }
  });
};

import React, {useEffect, useMemo, useState} from 'react';
import {Data, InteractiveMoneyTreeMap} from "./InteractiveMoneyTreeMap";
import {initialIncoming} from "./initialIncoming";
import {initialOutgoing} from "./initialOutgoing";

const INITIAL_BORROWING = 135_000; // will be multiplied by a million elsewhere
const incomingDataSeedWithBorrowing: Data = {
  "Borrowing": {
    "NEW Debt Bonds": {
      description: "new government bonds issued to raise funds",
      changeableProperties: {
        amount: {
          value: INITIAL_BORROWING,
          unit: "£",
          increment: 1_000
        }
      },
      value() {
        return this.changeableProperties.amount.value;
      }
    }
  }
};

function App() {

  // EVERYTHING IS IN MILLIONS OF POUNDS (for d3 perf reasons)
  const [incomingTotal, setIncomingTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);

  const [borrowing, setBorrowing] = useState(INITIAL_BORROWING);

  const stateURLParamNameForInflation = "inflation";
  const getInflationFromURL = () => parseFloat(
    new URLSearchParams(window.location.search).get(stateURLParamNameForInflation) || "3"
  );
  const [inflation, setInflation] = useState(getInflationFromURL());
  useEffect(() => {
    window.addEventListener(
      'popstate',
      () => {
        setInflation(getInflationFromURL());
      }
    );
  }, []);
  const mutateInflation = (direction:"up"|"down") => () => setInflation(prevInflation => {
    const newInflation = direction === "up" ? prevInflation + 0.5 : prevInflation - 0.5;

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(stateURLParamNameForInflation, newInflation.toFixed(2));
    const newURL = `${window.location.pathname}?${searchParams.toString()}`
    window.history.pushState(null, "", newURL);

    return newInflation;
  });

  const outgoingDataSeedWithBorrowing: Data = useMemo(() => ({
    "Debt": {
      "Interest on NEW Debt": {
        description: "cost of servicing the NEW debt (controlled on the left hand side), NOTE the rate is at least partially linked to inflation 😱",
        value() {
          const inflationBasedAmount = borrowing/2 * (inflation / 100);
          const fixedRateAmount = borrowing/2 * (this.changeableProperties.rate.value / 100);
          return inflationBasedAmount + fixedRateAmount;
        },
        changeableProperties: {
          rate: {
            value: 5,
            unit: "%",
            increment: 0.25
          }
        }
      },
      "Interest on OLD Debt": {
        description: "cost of servicing all the EXISTING debt (£2,318 BILLION as of Q2 2021), NOTE the rate is at least partially linked to inflation 😱",
        value() {
          const inflationBasedAmount = 1000_000 * (inflation / 100);
          const fixedRateAmount = 1318_000 * (this.changeableProperties.rate.value / 100);
          return inflationBasedAmount + fixedRateAmount;
        },
        changeableProperties: {
          rate: {
            value: 3,
            unit: "%",
            increment: 0.25
          }
        }
      },
      "Repayment": {
        description: "repaying debt",
        value() {
          return this.changeableProperties.amount.value;
        },
        changeableProperties: {
          amount: {
            value: 10_000,
            unit: "£",
            increment: 1_000
          }
        }
      }
    }
  }), [borrowing, inflation]);

  return (
    <div>
      <div style={{
        display: 'flex',
        margin: "20px",
      }}>
        <InteractiveMoneyTreeMap
          initialData={{
            ...initialIncoming,
            ...incomingDataSeedWithBorrowing
          }}
          total={incomingTotal}
          otherTotal={outgoingTotal}
          setTotal={setIncomingTotal}
          heading="Incoming"
          setBorrowing={setBorrowing}
        />
        <InteractiveMoneyTreeMap
          initialData={{
            ...initialOutgoing,
            ...outgoingDataSeedWithBorrowing
          }}
          total={outgoingTotal}
          otherTotal={incomingTotal}
          setTotal={setOutgoingTotal}
          heading={"Outgoing"}
          setBorrowing={setBorrowing}
        />
      </div>
      <div style={{textAlign: "center", position: "absolute", top: 0, left: 0, right: 0}}>
        <div><strong>INFLATION</strong></div>
        <button onClick={mutateInflation("down")}>➖</button>
        {inflation.toFixed(2)}%
        <button onClick={mutateInflation("up")}>➕</button>
      </div>
    </div>
  );
}

export default App;

import React, {useEffect, useMemo, useState} from 'react';
import {Data, InteractiveMoneyTreeMap} from "./InteractiveMoneyTreeMap";
import {initialIncoming} from "./initialIncoming";
import {initialOutgoing} from "./initialOutgoing";
import {EnterFullscreenOverlay} from "./EnterFullscreenOverlay";
import {FullScreen, useFullScreenHandle} from "react-full-screen";

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

  const isIFramed = useMemo(() => window.self !== window.top, []);

  const fullscreenHandle = useFullScreenHandle();

  const isFullscreen = fullscreenHandle.active;

  const canEnterFullscreen = isIFramed && !isFullscreen;

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
    <FullScreen handle={fullscreenHandle}>
      {canEnterFullscreen && (
        <EnterFullscreenOverlay onClick={fullscreenHandle.enter}/>
      )}
      {(!isIFramed || isFullscreen) && (
        <div style={{backgroundColor: "yellow", padding: "5px", textAlign: "center"}}>
          <h3>Warning</h3>
          This is a hack day project! It is not a complete model of the UK economy, there are many factors not covered here (so far at least).
          <br/>
          Whilst the data has primarily been sourced from the ONS, it has been input <strong>manually</strong>, roughly for the 4 quarters prior to when this was made (Nov 2022).
          <br/>
          <strong>TLDR; nothing you see here is fully journalistically accurate!</strong>
        </div>
      )}
      <div style={{
        display: 'flex',
        margin: "20px",
        position: "relative"
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
        <div style={{textAlign: "center", position: "absolute", top: 0, left: 0, right: 0}}>
          <div><strong>INFLATION</strong></div>
          <button onClick={mutateInflation("down")}>➖</button>
          {inflation.toFixed(2)}%
          <button onClick={mutateInflation("up")}>➕</button>
        </div>
      </div>
      {(!isIFramed || isFullscreen) && (
        <div style={{fontSize: "90%", bottom: "5px", right: 0, position: "fixed" }}>
          <span style={{backgroundColor: "lightgray", padding: "5px", borderTopLeftRadius: "5px"}}>
            Source code: <a href="https://github.com/guardian/balancing-the-books">https://github.com/guardian/balancing-the-books</a>
          </span>
        </div>
      )}
      {isFullscreen && (
        <div style={{bottom: "5px", left: 0, position: "fixed", cursor: "pointer" }} onClick={fullscreenHandle.exit}>
          <strong style={{backgroundColor: "lightgray", padding: "5px", borderTopRightRadius: "5px"}}>
            EXIT FULLSCREEN
          </strong>
        </div>
      )}
      {/*TODO add a share button, centered probably*/}
    </FullScreen>
  );
}

export default App;

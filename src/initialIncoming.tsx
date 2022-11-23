import {Data} from "./InteractiveMoneyTreeMap";

// EVERYTHING IS IN MILLIONS OF POUNDS (for d3 perf reasons)

const rudimentaryThresholdModifier = (initialThreshold: number, threshold: number) => initialThreshold === threshold ? 1.0 : (
  1.0 + (((initialThreshold - threshold) / initialThreshold)/3)
)

const totalIncomeTaxRevenue2022 = 224_900;

export const initialIncoming: Data = {
  "Personal Tax": {
    "'basic' rate": {
      description: "lowest band of income tax, but affects most of population and the threshold has a huge impact on the poorest and therefore poverty levels",
      relatedArticles: [
        {
          headline: "Let's raise the 'basic' rate threshold and lift millions out of working poverty",
          url: "https://theguardian.com"
        }
      ],
      changeableProperties: {
        rate: {
          value: 20,
          unit: "%",
          increment: 1,
        },
        threshold: {
          value: 0.01257,
          unit: "£",
          increment: 0.0005,
        }
      },
      value() {
        const amountIn2022 = (totalIncomeTaxRevenue2022 * 0.331) / 0.2;
        const thresholdModifier = rudimentaryThresholdModifier(0.01257, this.changeableProperties.threshold.value);
        return amountIn2022 * (this.changeableProperties.rate.value / 100) * thresholdModifier;
      }
    },
    "'higher' rate": {
      description: "middle band of income tax",
      changeableProperties: {
        rate: {
          value: 40,
          unit: "%",
          increment: 1,
        },
        threshold: {
          value: 0.05027,
          unit: "£",
          increment: 0.001,
        }
      },
      value() {
        const amountIn2022 = (totalIncomeTaxRevenue2022 * 0.331) / 0.4;
        const thresholdModifier = rudimentaryThresholdModifier(0.05027, this.changeableProperties.threshold.value);
        return amountIn2022 * (this.changeableProperties.rate.value / 100) * thresholdModifier;
      }
    },
    "'additional' rate": {
      description: "'top rate' of income tax, only really affects the wealthiest",
      changeableProperties: {
        rate: {
          value: 45,
          unit: "%",
          increment: 1,
        },
        threshold: {
          value: 0.15,
          unit: "£",
          increment: 0.0025,
        }
      },
      value() {
        const amountIn2022 = (totalIncomeTaxRevenue2022 * 0.336) / 0.45;
        const thresholdModifier = rudimentaryThresholdModifier(0.15, this.changeableProperties.threshold.value);
        return amountIn2022 * (this.changeableProperties.rate.value / 100) * thresholdModifier;
      }
    },
    "National Insurance": {
      changeableProperties: {
        rate: {
          value: 12,
          unit: "%",
          increment: 0.5,
        },
        "threshold (pw)": {
          value: 0.000242,
          unit: "£",
          increment: 0.000005,
        }
      },
      value() {
        // reverse engineering amount from £158billion in 2022
        const thresholdModifier = rudimentaryThresholdModifier(0.000242, this.changeableProperties["threshold (pw)"].value);
        return 1316_000 * (this.changeableProperties.rate.value / 100) * thresholdModifier;
      }
    },
    "Capital Gains": {
      changeableProperties: {
        rate: {
          value: 20,
          unit: "%",
          increment: 1,
        }
        //TODO add a threshold
      },
      value() {
        // reverse engineering amount from £20.4billion in 2022
        return 102_000 * (this.changeableProperties.rate.value / 100);
      }
    }
  },
  "Business Tax": {
    "Corporation Tax": {
      description: "the tax rate on PROFITS made by companies",
      changeableProperties: {
        rate: {
          value: 19,
          unit: "%",
          increment: 1,
        },
        // threshold: {
        //   value: 0,
        //   unit: "£",
        //   increment: 1,
        // }
      },
      value() {
        // FIXME then re-instate the threshold on Corporation Tax
        // const thresholdModifier = rudimentaryThresholdModifier(0, this.changeableProperties.threshold.value);
        // reverse engineering amount from £61.4billion in 2022
        return 323_000 * (this.changeableProperties.rate.value / 100); // * thresholdModifier;
      }
    },
    "Other": {
      changeableProperties: {
        amount: {
          value: 82_900,
          unit: "£",
          increment: 2_500,
        }
      },
      value() {
        return this.changeableProperties.amount.value;
      }
    },
  },
  "Other": {
    "VAT": {
      changeableProperties: {
        rate: {
          value: 20,
          unit: "%",
          increment: 1,
        }
      },
      value() {
        // reverse engineering amount from £182billion in 2022
        return 910_000 * (this.changeableProperties.rate.value/100);
      }
    },
    "Property Taxes": {
      changeableProperties: {
        amount: {
          value: 40_000,
          unit: "£",
          increment: 1_000,
        }
      },
      value() {
        return this.changeableProperties.amount.value;
      }
    },
    "Excise Taxes": {
      changeableProperties: {
        amount: {
          value: 34_600,
          unit: "£",
          increment: 1_000,
        }
      },
      value() {
        return this.changeableProperties.amount.value;
      }
    },
    "Other": {
      changeableProperties: {
        amount: {
          value: 80_000,
          unit: "£",
          increment: 2_500,
        }
      },
      value() {
        return this.changeableProperties.amount.value;
      }
    }
  }
};

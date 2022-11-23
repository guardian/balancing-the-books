import {Data, Datum} from "./InteractiveMoneyTreeMap";

// EVERYTHING IS IN MILLIONS OF POUNDS (for d3 perf reasons)

const simpleAmount = (amountInMillions: number, increment: number, description?: string): Datum => ({
  description,
  changeableProperties: {
    amount: {
      value: amountInMillions,
      unit: "£",
      increment,
    }
  },
  value() {
    return this.changeableProperties.amount.value;
  }
});

export const initialOutgoing: Data = {
  "Defence": {
    "Military": simpleAmount(45_000, 2_500, "Army, Navy, RAF etc"),
    "Foreign Aid": simpleAmount(6_000, 1_000, "Foreign economic and military aid"),
    "Other": simpleAmount(3_000, 1_000, "Other defence spending such as R&D"),
  },
  "Education": {
    "Primary Education": simpleAmount(20_000, 1_000),
    "Secondary Education": simpleAmount(40_000, 1_000),
    "Further Education": simpleAmount(30_00, 500),
    "Other": simpleAmount(10_000, 250)
  },
  "Health Care (NHS)": {
    "Medical services": simpleAmount(188_400, 10_000),
    "Public health services": simpleAmount(22_900, 1_000),
    "Other": simpleAmount(1_700, 100, "Other health care spending such as R&D"),
  },
  "Welfare": {
    "Old Age Pensions": simpleAmount(115_800, 10_000),
    "Sickness & Disability": simpleAmount(49_300, 1_000),
    "Family & children": simpleAmount(14_800, 1_000),
    "Unemployment": simpleAmount(1_200, 100),
    "Housing benefit": simpleAmount(6_000, 500),
    "Social exclusion": simpleAmount(54_800, 2500),
    "Social protection": simpleAmount(61_100, 5_000),
  },
  "Protection": {
    "Police": simpleAmount(5_400, 250),
    "Law courts": simpleAmount(7_800, 250),
    "Prisons": simpleAmount(5_400, 250),
    "Other": simpleAmount(5_000, 500, "Other protection spending such as Fire Service"),
  },
  "Transport": {
    "Rail": simpleAmount(22_600, 1_000),
    "Roads": simpleAmount(5_800, 500),
    "Other": simpleAmount(10_000, 1_000),
  },
  "General Gov.": {
    "Executive and legislative": simpleAmount(21_000, 1_000),
    "Other": simpleAmount(9_300, 500),
  },
  "Other": {
    "General economic, commercial and labour": simpleAmount(35_000, 250),
    "Private School Tax Break": simpleAmount(3_000, 1_000, "cost of 'charitable status' for private schools"),
    "Other": simpleAmount(160_000, 10_000, "all manner of stuff that doesn't fit into the above categories"),
  }
};

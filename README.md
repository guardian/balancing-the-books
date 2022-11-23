> **Warning**
> This was Hack Day project so is incomplete, buggy and figures are not 100% accurate.

> **Note**
> This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Balancing the Books

A visualisation of UK government revenue/tax VS spending, which aims to make clear the scale of figures RELATIVE to one another, so people can be more objective when interpretting and understanding the impact of the otherwise mind-boggling figures!

The figures are roughly for 2022 (manually input into this tool's JSON model, curated mainly from https://www.ons.gov.uk and https://www.ukpublicspending.co.uk).



### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## What's next...
There's hopefully some potential here, but lots to do, e.g.

#### Major

- read in granular data (ideally exclusively from ONS exports, or better APIs) and aggregate to the level required in the UI
- allow zooming to dig deeper into certain areas
- weight most things by inflation (rather than just half of national debt interest, which it bluntly/crudely does now)
- allow rolling back through time (defaulting to the last 4 quarters?)
- ensure spending across multiple years (e.g. service government debt OR big infrastructure spending like HS2) is correctly divided to be representative
- add a third _complementary_ visualisation to show real world impact of these changes, e.g.
  - more/less nurses, police etc.
  - public sector pay rises
  - more foreign aid
  - free school meals
  - number of people lifted out of poverty (perhaps with adult/children breakdown)

#### Minor

- improve colours
- further improve text sizing/wrapping in TreeMap


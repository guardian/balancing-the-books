import React, {Fragment, useEffect, useMemo, useState} from "react";
import {HierarchyData, TreeMap, Identifier} from "./TreeMap";

type Unit = "%" | "£"

interface ChangeableProperties {
  [name: string]: {
    value: number,
    unit: Unit
    increment: number,
  }
}

export interface Datum {
  value: () => number;
  description?: string,
  changeableProperties: ChangeableProperties,
  relatedArticles?: Array<{
    headline: string,
    url: string
  }>
}

export interface Data {
  [group: string]: {
    [name: string]: Datum
  }
}

export interface Changes {
  [group: string]: {
    [name: string]: ChangeableProperties
  }
}

const getById = (data: Data, identifier: Identifier) => data[identifier.group][identifier.name];

const format = (value: number, unit: Unit) => {
  switch (unit) {
    case "%":
      return `${value.toFixed(2)}%`;
    case "£":
      return `£${Math.round(value * 1_000_000).toLocaleString()}`;
  }
}

interface InteractiveMoneyTreeMapProps {
  initialData: Data;
  total: number;
  otherTotal: number;
  setTotal: (total: number) => void;
  heading: "Incoming" | "Outgoing";
  setBorrowing: (newBorrowing: number) => void;
}

export const InteractiveMoneyTreeMap = ({
  initialData,
  total,
  otherTotal,
  setTotal,
  heading,
  setBorrowing
}: InteractiveMoneyTreeMapProps) => {

  const isRightAligned = heading === "Incoming";

  const stateURLParamName = `changesTo${heading}`;
  const getChangesFromURL = () => JSON.parse(new URLSearchParams(window.location.search).get(stateURLParamName) || "{}");
  const [changes, setChanges] = useState<Changes>(
    getChangesFromURL()
  );
  useEffect(() => {
    window.addEventListener(
      'popstate',
      () => {
        setChanges(getChangesFromURL());
      }
    );
  }, []);

  const changesList = useMemo(
    () =>
      Object.entries(changes).flatMap(([group, groupChanges]) =>
        Object.entries(groupChanges).flatMap(([name, changeableProperties]) =>
          Object.entries(changeableProperties).map(([changeablePropertyName, changeableProperty]) =>
            ({
              group,
              name,
              changeablePropertyName,
              ...changeableProperty,
              initialValue: getById(initialData, {group, name}).changeableProperties[changeablePropertyName].value
            })
          )
        )
      ),
    [changes]
  );
  useEffect(() => {

  }, [changes]);

  const data: Data = useMemo(() => Object.entries(initialData).reduce((outerAcc, [group, groupData]) => ({
    ...outerAcc,
    [group]: Object.entries(groupData).reduce((innerAcc, [name, datum]) => ({
      ...innerAcc,
      [name]: {
        ...datum,
        changeableProperties: {
          ...datum.changeableProperties,
          ...(changes[group]?.[name] || {})
        }
      }
    }), {} as Data[string])
  }), {} as Data), [changes, initialData]);

  const hierarchyData: HierarchyData = useMemo(() => ({
    children: Object.entries(data).map(([group, groupData]) => ({
      name: group,
      children: Object.entries(groupData).map(([name, datum]) => ({
        name,
        group,
        value: datum.value(),
        hasChanges: Object.keys(changes[group]?.[name] || {}).length > 0
      }))
    }))
  }), [initialData, changes]);

  useEffect(() => {
    setTotal(hierarchyData.children.reduce((acc, {children}) => acc + children.reduce((acc, {value}) => acc + value, 0), 0));
  }, [hierarchyData]);

  const [selected, setSelected] = useState<Identifier>();
  const selectedDatum = useMemo(() => selected && data[selected.group][selected.name], [selected, data]);

  const mutateChanges = (direction: "up" | "down" | "remove", changeablePropertyName: string, {group, name}: Identifier) => () => setChanges(prevChanges => {
    const previousGroup = prevChanges[group] || {};
    const previousChangeableProperties = previousGroup[name] || {};
    const initialChangeableProperty = getById(initialData, {group, name}).changeableProperties[changeablePropertyName];
    const previousChangeableProperty = previousChangeableProperties[changeablePropertyName] || initialChangeableProperty;

    const {[changeablePropertyName]:_, ...previousChangeablePropertiesForSpread} = previousChangeableProperties;

    const newValue = previousChangeableProperty.value + (direction === "up" ? 1 : -1) * previousChangeableProperty.increment;

    const shouldRemove = direction === "remove" || newValue === initialChangeableProperty.value;

    if(group === "Borrowing" && name === "NEW Debt Bonds" && changeablePropertyName === "amount") {
      setBorrowing(newValue);
    }

    const newChanges = {
      ...prevChanges,
      [group]: {
        ...(previousGroup || {}),
        [name]: shouldRemove ? previousChangeablePropertiesForSpread : {
          ...previousChangeablePropertiesForSpread,
          [changeablePropertyName]: {
            ...previousChangeableProperty,
            value: newValue
          }
        }
      }
    } as Changes;

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(stateURLParamName, JSON.stringify(newChanges));
    const newURL = `${window.location.pathname}?${searchParams.toString()}`
    window.history.pushState(null, "", newURL);

    return newChanges;
  });

  const diff = total - otherTotal;

  return <div style={{
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    fontStyle: "italic",
  }}>
    <div style={{textAlign: isRightAligned ? "left" : "right"}}>
      <h1>{heading}</h1>
      <h3>Total: {format(total, "£")}</h3>
    </div>
    <div style={{
      display: "flex",
      alignItems: "center",
      flexDirection: isRightAligned ? "row" : "row-reverse",
      justifyContent: "flex-end", // the above changes if this means left or right
      [`border${isRightAligned ? "Right" : "Left"}`]: "1px solid black",
      height: "40px",
      marginTop: "40px",
      gap: "10px",
      textAlign: isRightAligned ? "right" : "left",
    }}>
      {diff > 0
        ? <Fragment>
          <span>{heading === "Incoming" ? "Surplus" : "Deficit"} of {format(diff, "£")}</span>
          <div style={{
            backgroundColor: heading === "Incoming" ? "green" : "red",
            width: `${(diff / total * 100).toFixed()}%`,
            height: "20px"
          }}/>
        </Fragment>
        : <span>
            You should {heading === "Incoming" ? "collect" : "spend"} more money
            (or {heading === "Outgoing" ? "collect" : "spend"} less)
          </span>
      }
    </div>
    <TreeMap
      hierarchyData={hierarchyData}
      selected={selected}
      setSelected={setSelected}
      colours={heading === "Incoming"
        ? ["#4c67bd", "#263867", "#4495b2", "#061f49"]
        : ["#852234", "#cc3e57", "#bd6c7a", "#c2001e"]
      }
    />
    {selected && selectedDatum ? (
      <div>
        <h3>SELECTED: {selected.group} &gt; {selected.name}</h3>
        {format(selectedDatum.value(), "£")}
        {selectedDatum.description && <p>{selectedDatum.description}</p>}
        <table style={{marginTop: "20px"}}>
          <tbody>
          {Object.entries(selectedDatum.changeableProperties).map(([changeablePropertyName, {value, unit, increment}]) => {

            const initialValue = getById(initialData, selected).changeableProperties[changeablePropertyName].value;

            return (
              <tr key={changeablePropertyName}>
                <th>{changeablePropertyName}</th>
                <th>
                  <button onClick={mutateChanges("down", changeablePropertyName, selected)}>➖ {format(increment, unit)}</button>
                </th>
                <th>
                  <button onClick={mutateChanges("up", changeablePropertyName, selected)}>➕ {format(increment, unit)}</button>
                </th>
                <td>
                  {initialValue === value
                    ? format(value, unit)
                    : <Fragment>
                      <s>{format(initialValue, unit)}</s>
                      &nbsp;
                      <em>{format(value, unit)}</em>
                    </Fragment>
                  }
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
        {selectedDatum.relatedArticles && <Fragment>
          <h4 style={{marginTop: "20px"}}>Related Articles</h4>
          <ul>
            {selectedDatum.relatedArticles.map(({headline, url}) =>
              <li key={url}>
                <a href={url} target="_blank">
                  {headline}
                </a>
              </li>
            )}
          </ul>
        </Fragment>}
      </div>
    ) : (
      <em>Click on a rectangle to see more info and make changes...</em>
    )}
    {changesList.length > 0 && (
      <Fragment>
        <h3 style={{marginTop: "30px"}}>ALL Changes to '{heading}'</h3>
        <ul>
          {changesList.map(({group, name, changeablePropertyName, value, unit, initialValue}, index) => (
            <li key={index}>
              <span  onClick={() => setSelected({group, name})}>
                the <b>{changeablePropertyName}</b> on the <b>{name} ({group})</b>
                is now <b>{format(value, unit)}</b> (was {format(initialValue, unit)})
              </span>
              <button onClick={mutateChanges("remove", changeablePropertyName, {group, name})}>🗑</button>
            </li>
          ))}
        </ul>
      </Fragment>
    )}
  </div>
}

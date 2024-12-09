import { useEffect, useState } from "react";

import {
  convertObjToArray,
  convertValuesToNumbers,
  hasDuplicateKeys,
} from "@/utils/reactflowUtils";
import { cloneDeep } from "lodash";
import IconComponent from "../../../genericIconComponent";
import { Input } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { InputProps, ParameterListComponentType } from "../../types";
import useFlowStore from "../../../../stores/flowStore";
import {getSuggetionListFromOutputVariables,} from "../../../../utils/reactflowUtils";
import {useGetGlobalVariables,} from "@/controllers/API/queries/variables";

export default function ParameterListComponent({
  value,
  handleOnNewValue,
  disabled,
  editNode = false,
  isList = true,
  id,
  nodeId,
}: InputProps<
  object[] | object | string,
  ParameterListComponentType
>): JSX.Element {
  useEffect(() => {
    if (disabled && value.length > 0 && value[0] !== "") {
      handleOnNewValue({ value: [{ "": ["", false] }] }, { skipSnapshot: true });
    }
  }, [disabled]);


  const nodes = useFlowStore((state) => state.nodes);
  const { data: globalVariables } = useGetGlobalVariables();

  const suggestions: string [] = getSuggetionListFromOutputVariables(
    nodeId===undefined ? nodes: nodes.filter((n) => n.id!==nodeId || (n.data.type!=="note" && n.data.type!=="Group")), 
    globalVariables
  );

  const [duplicateKey, setDuplicateKey] = useState(false);

  const values =
    Object.keys(value || {})?.length === 0 || !value
      ? [{ "": ["", false] }]
      : convertObjToArray(value, "dict");

  Array.isArray(value) ? value : [value];

  const handleNewValue = (newValue: any) => {
    const valueToNumbers = convertValuesToNumbers(newValue);
    setDuplicateKey(hasDuplicateKeys(valueToNumbers));
    if (isList) {
      handleOnNewValue({ value: valueToNumbers });
    } else handleOnNewValue({ value: valueToNumbers[0] });
  };

  const handleChangeKey = (event, idx) => {
    const oldKey = Object.keys(values[idx])[0];
    const updatedObj = { [event.target.value]: values[idx][oldKey] };

    const newValue = cloneDeep(values);
    newValue[idx] = updatedObj;

    handleNewValue(newValue);
  };

  const handleChangeValue = (event, idx) => {
    const key = Object.keys(values[idx])[0];
    const updatedObj = { [key]: [event.target.value, values[idx][key][1]] };

    const newValue = cloneDeep(values);
    newValue[idx] = updatedObj;

    handleNewValue(newValue);
  };

  const handleChangeValue2 = (isEnabled, idx) => {
    const key = Object.keys(values[idx])[0];
    const updatedObj = { [key]: [values[idx][key][0], isEnabled] };

    const newValue = cloneDeep(values);
    newValue[idx] = updatedObj;

    handleNewValue(newValue);
  };

  const addNewKeyValuePair = () => {
    const newValues = cloneDeep(values);
    newValues.push({ "": ["", false] });
    handleOnNewValue({ value: newValues });
  };

  const removeKeyValuePair = (index) => {
    const newValues = cloneDeep(values);
    newValues.splice(index, 1);
    handleOnNewValue({ value: newValues });
  };

  const getInputClassName = (isEditNode, isDuplicateKey) => {
    return `${isEditNode ? "input-edit-node" : ""} ${isDuplicateKey ? "input-invalid" : ""}`.trim();
  };

  const getTestId = (prefix, index) =>
    `${editNode ? "editNode" : ""}${prefix}${index}`;

  let scaleX, scaleY;
  if (editNode) {
    scaleX = 0.6;
    scaleY = 0.6;
  } else {
    scaleX = 1;
    scaleY = 1;
  }

  return (
    <div
      className={`flex h-full flex-col gap-3 ${values?.length > 1 && editNode ? "mx-2 my-1" : ""}`}
    >
      {values?.map((obj, index) =>
        Object.keys(obj).map((key, idx) => (
          <div key={idx} className="flex w-full gap-2">
            <Input
              data-testid={getTestId("paramList", index)}
              id={getTestId("paramList", index)}
              type="text"
              value={key.trim()}
              className={getInputClassName(editNode, duplicateKey)}
              placeholder="Type key..."
              onChange={(event) => handleChangeKey(event, index)}
            />

            <Input
              data-testid={getTestId("paramList", index + 100)}
              id={getTestId("paramList", index + 100)}
              type="text"
              disabled={disabled}
              value={obj[key][0]}
              className={editNode ? "input-edit-node" : ""}
              placeholder="Type a value..."
              onChange={(event) => {
                if(suggestions && suggestions.length>0){
                  const pointer = event.target.selectionStart;
                  window.requestAnimationFrame(() => {
                    event.target.selectionStart = pointer;
                    event.target.selectionEnd = pointer;
                  });
                }
                handleChangeValue(event, index);
              }}
              suggestions={suggestions}
            />

            <Switch
              id={getTestId("paramList", index + 200)}
              data-testid={getTestId("paramList", index + 200)}
              style={{
                transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
              }}
              disabled={disabled}
              className=""
              checked={obj[key][1]}
              onCheckedChange={(isEnabled: boolean) => handleChangeValue2(isEnabled, index)}
            ></Switch>

            {isList &&
              (index === values.length - 1 ? (
                <button
                  disabled={disabled}
                  onClick={addNewKeyValuePair}
                  id={getTestId("plusbtn", index)}
                  data-testid={id}
                >
                  <IconComponent
                    name="Plus"
                    className="h-4 w-4 hover:text-accent-foreground"
                  />
                </button>
              ) : (
                <button
                  onClick={() => removeKeyValuePair(index)}
                  data-testid={getTestId("minusbtn", index)}
                  id={getTestId("minusbtn", index)}
                >
                  <IconComponent
                    name="X"
                    className="h-4 w-4 hover:text-status-red"
                  />
                </button>
              ))}
          </div>
        )),
      )}
    </div>
  );
}

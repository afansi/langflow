import { useEffect, useState } from "react";

import _ from "lodash";
import { classNames, cn } from "../../../../utils/utils";
import IconComponent from "../../../genericIconComponent";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { InputListComponentType, InputProps } from "../../types";
import useFlowStore from "../../../../stores/flowStore";
import {getSuggetionListFromOutputVariables,} from "../../../../utils/reactflowUtils";
import {useGetGlobalVariables,} from "@/controllers/API/queries/variables";

export default function InputListComponent({
  value = [""],
  handleOnNewValue,
  disabled,
  editNode = false,
  componentName,
  id,
}: InputProps<string[], InputListComponentType>): JSX.Element {
  useEffect(() => {
    if (disabled && value.length > 0 && value[0] !== "") {
      handleOnNewValue({ value: [""] }, { skipSnapshot: true });
    }
  }, [disabled]);


  const nodes = useFlowStore((state) => state.nodes);
  const { data: globalVariables } = useGetGlobalVariables();

  const suggestions: string [] = getSuggetionListFromOutputVariables(nodes, globalVariables);

  // @TODO Recursive Character Text Splitter - the value might be in string format, whereas the InputListComponent specifically requires an array format. To ensure smooth operation and prevent potential errors, it's crucial that we handle the conversion from a string to an array with the string as its element.
  if (typeof value === "string") {
    value = [value];
  }

  if (!value?.length) value = [""];

  const handleInputChange = (index, newValue) => {
    const newInputList = _.cloneDeep(value);
    newInputList[index] = newValue;
    handleOnNewValue({ value: newInputList });
  };

  const addNewInput = (e) => {
    e.preventDefault();
    const newInputList = _.cloneDeep(value);
    newInputList.push("");
    handleOnNewValue({ value: newInputList });
  };

  const removeInput = (index, e) => {
    e.preventDefault();
    const newInputList = _.cloneDeep(value);
    newInputList.splice(index, 1);
    handleOnNewValue({ value: newInputList });
  };

  const getButtonClassName = () =>
    classNames(
      disabled
        ? "cursor-not-allowed text-muted-foreground"
        : "text-primary hover:text-accent-foreground",
    );

  const getTestId = (type, index) =>
    `input-list-${type}-btn${editNode ? "-edit" : ""}_${componentName}-${index}`;

  return (
    <div
      className={classNames(
        value.length > 1 && editNode ? "my-1" : "",
        "flex w-full flex-col gap-3",
      )}
    >
      {value.map((singleValue, index) => (
        <div key={index} className="flex w-full gap-3">
          <Input
            disabled={disabled}
            type="text"
            value={singleValue}
            className={editNode ? "input-edit-node" : ""}
            placeholder="Type something..."
            onChange={(event) => {
              if(suggestions && suggestions.length>0){
                const pointer = event.target.selectionStart;
                window.requestAnimationFrame(() => {
                  event.target.selectionStart = pointer;
                  event.target.selectionEnd = pointer;
                });
              }
              handleInputChange(index, event.target.value);
            }}
            data-testid={`${id}_${index}`}
            suggestions={suggestions}
          />
          <Button
            unstyled
            className={getButtonClassName()}
            onClick={index === 0 ? addNewInput : (e) => removeInput(index, e)}
            data-testid={getTestId(index === 0 ? "plus" : "minus", index)}
            disabled={disabled}
          >
            <IconComponent
              name={index === 0 ? "Plus" : "X"}
              className="h-4 w-4"
            />
          </Button>
        </div>
      ))}
    </div>
  );
}

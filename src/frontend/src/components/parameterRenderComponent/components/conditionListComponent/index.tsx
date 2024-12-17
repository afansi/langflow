import { useEffect, useState } from "react";
import _ from "lodash";
import IconComponent from "../../../genericIconComponent";
import Dropdown from "../../../dropdownComponent";
import { classNames } from "../../../../utils/utils";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { InputProps, ConditionListComponentType } from "../../types";
import useFlowStore from "../../../../stores/flowStore";
import {
  OPERANDS, OPERANDS_WITH_NO_VALUES,
} from "@/flow_constants";
import { NodeDataType } from "@/types/flow";
import { OutputFieldType } from "@/types/api";
import {getSuggetionListFromOutputVariables,} from "../../../../utils/reactflowUtils";
import {useGetGlobalVariables,} from "@/controllers/API/queries/variables";
import ConditionName from "./conditionName";
import useFlowsManagerStore from "@/stores/flowsManagerStore";

export default function ConditionListComponent({
  value,
  handleOnNewValue,
  handleNodeClass,
  disabled,
  editNode = false,
  isList = true,
  id,
  nodeId,
}: InputProps<
  object[] | object | string,
  ConditionListComponentType
>): JSX.Element {
  useEffect(() => {
    if (disabled && value.length > 0 && value[0] !== "") {
      handleOnNewValue({ value: [] }, { skipSnapshot: true });
    }
  }, [disabled]);

  const prefix = "Condition";

  // @TODO Recursive Character Text Splitter - the value might be in string format, whereas the InputListComponent specifically requires an array format. To ensure smooth operation and prevent potential errors, it's crucial that we handle the conversion from a string to an array with the string as its element.
  if (typeof value === "string") {
    if(value.length > 0){
      value = [[`${prefix}_1`, OPERANDS[0], value]];
    }else{
      value = [];
    }      
  }

  if (!value) value = [];

  const [condList, setCondList] = useState(value);

  useEffect(() => {
    setCondList(value);
  }, [value]);

  const nodes = useFlowStore((state) => state.nodes);
  const setNode = useFlowStore((state) => state.setNode);
  const takeSnapshot = useFlowsManagerStore((state) => state.takeSnapshot);

  const nodeIndex = nodes.findIndex((n) => n.id === nodeId);

  const nodeData1: NodeDataType = nodeIndex !== -1 ? nodes[nodeIndex].data : undefined;

  const isGroupNode: boolean = nodeData1?.type === "GroupNode";

  const operandWithNoValueSets = new Set<string>(OPERANDS_WITH_NO_VALUES);

  const { data: globalVariables } = useGetGlobalVariables();

  const suggestions: string [] = getSuggetionListFromOutputVariables(
    nodes.filter((n) => n.id!==nodeId || n.data.type==="GroupNode"), 
    globalVariables
  );

  const refValueList = condList;

  const checkUniqueness = (condName: string): boolean => {
    if(condName.toLowerCase()==="nomatch"){
      return false;
    }
    return !(refValueList?.map(v => v[0].toLowerCase()).includes(condName.toLowerCase()));
  }

  const getInitCondName = (currentNames: string[]): string => {
    let newName = `${prefix}_1`;
    let count = 1;  
    while (currentNames.includes(newName.toLowerCase())) {
      count++;
      newName = `${prefix}_${count}`;
    }  
    return newName;
  }

  const handleConditionInputChange = (index, newCondName) => {
    takeSnapshot();
    const newInputList = _.cloneDeep(refValueList);
    newInputList[index][0] = newCondName;
    //this should happen before the setNode instruction below
    handleOnNewValue({ value: newInputList });

    const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
    const nodeData: NodeDataType = nodeIndex !== -1 ? nodes[nodeIndex].data : undefined;
    // change the value of the node output
    if (nodeData?.node?.outputs && nodeData?.node?.outputs?.length > (index+1)) {
      const newOutputs = _.cloneDeep(nodeData?.node?.outputs);
      newOutputs[index+1].name = newCondName;
      newOutputs[index+1].display_name = newCondName;
      setNode(nodeId, (old) => ({
        ...old,
        data: {
          ...old.data,
          node: {
            ...old.data.node,
            outputs: newOutputs,
          },
        },
      }));
    }
    setCondList(newInputList);
  };

  const handleOperandInputChange = (index, newOperand) => {
    const newInputList = _.cloneDeep(refValueList);
    newInputList[index][1] = newOperand;
    if(operandWithNoValueSets.has(newOperand)){
      newInputList[index][2] = "";
    }
    setCondList(newInputList);
    handleOnNewValue({ value: newInputList });
  };

  const handleValueInputChange = (index, newValue) => {
    const newInputList = _.cloneDeep(refValueList);
    newInputList[index][2] = newValue;
    setCondList(newInputList);
    handleOnNewValue({ value: newInputList });
  };

  const addNewInput = (e) => {
    takeSnapshot();
    e.preventDefault();
    const newInputList = _.cloneDeep(refValueList);
    const condName = getInitCondName(refValueList?.map(v => v[0].toLowerCase()));
    newInputList.push([condName, OPERANDS[0], ""]);
    //this should happen before the setNode instruction below
    handleOnNewValue({ value: newInputList });

    const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
    const nodeData: NodeDataType = nodeIndex !== -1 ? nodes[nodeIndex].data : undefined;
    if (nodeData?.node?.outputs && nodeData?.node?.outputs?.length>0) {
      const newOutput: OutputFieldType = _.cloneDeep(nodeData?.node?.outputs[0]);
      newOutput.name = condName;
      newOutput.display_name = newOutput.name
      newOutput.hidden = false;
      setNode(nodeId, (old) => ({
        ...old,
        data: {
          ...old.data,
          node: {
            ...old.data.node,
            outputs: [
              ...old.data.node.outputs,
              newOutput
            ],
          },
        },
      }));
    }
    setCondList(newInputList);
  };

  const removeInput = (index, e) => {
    takeSnapshot();
    e.preventDefault();
    const newInputList = _.cloneDeep(refValueList);
    newInputList.splice(index, 1);
    //this should happen before the setNode instruction below
    handleOnNewValue({ value: newInputList });

    const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
    const nodeData: NodeDataType = nodeIndex !== -1 ? nodes[nodeIndex].data : undefined;
    if (nodeData?.node?.outputs && nodeData?.node?.outputs?.length > (index+1)) {
      const newOutputs = _.cloneDeep(nodeData?.node?.outputs);
      newOutputs.splice(index + 1, 1);
      setNode(nodeId, (old) => ({
        ...old,
        data: {
          ...old.data,
          node: {
            ...old.data.node,
            outputs: newOutputs,
          },
        },
      }));
    }
    setCondList(newInputList);
  };

  const getButtonClassName = () =>
    classNames(
      disabled
        ? "cursor-not-allowed text-muted-foreground"
        : "text-primary hover:text-accent-foreground",
    );

  const getTestId = (type, index) =>
    `input-list-${type}-btn${editNode ? "-edit" : ""}_condition_${id}-${index}`;

  return (
    <div
      className={classNames(
        condList.length > 1 && editNode ? "mx-2 my-1" : "",
        "flex w-full flex-col gap-3",
      )}
    >
      <div key={`x`} className="flex w-full gap-2">
          <Input
            disabled={true}
            type="text"
            value="No Match"
            className=""
            data-testid={`condName_${id}_x`}
          />
          <Input
            disabled={true}
            type="text"
            value=""
            className=""
            data-testid={`operand_${id}_x`}
          />
          <Input
            disabled={true}
            type="text"
            value=""
            className=""
            data-testid={`value_${id}_x`}
          />
          {!isGroupNode && (<Button
            unstyled
            className={getButtonClassName()}
            onClick={addNewInput}
            data-testid={getTestId("plus", "x")}
            disabled={disabled}
          >
            <IconComponent
              name={"Plus"}
              className="h-4 w-4"
            />
          </Button>
          )}
      </div>
      {condList.map((singleValue, index) => (
        <div key={index} className="flex w-full gap-2">
          <ConditionName 
            display_name={singleValue[0]}
            selected={false}
            nodeId={nodeId}
            checkUniqueness={checkUniqueness}
            isWithinGroupNode={isGroupNode}
            updateState={(condName) => handleConditionInputChange(index, condName)}
          />
          <Dropdown
            disabled={disabled}
            editNode={editNode}
            options={OPERANDS}
            onSelect={(selectedValue) => handleOperandInputChange(index, selectedValue)}
            combobox={true}
            value={singleValue[1]}
            id={`dropdown_operand_${id}_${index}`}
          />
          <Input
            disabled={disabled || operandWithNoValueSets.has(singleValue[1])}
            type="text"
            value={singleValue[2]}
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
              handleValueInputChange(index, event.target.value);
            }}
            data-testid={`value_${id}_${index}`}
            suggestions={suggestions}
          />
          {!isGroupNode && (<Button
            unstyled
            className={getButtonClassName()}
            onClick={(e) => removeInput(index, e)}
            data-testid={getTestId("minus", index)}
            disabled={disabled}
          >
            <IconComponent
              name={"X"}
              className="h-4 w-4"
            />
          </Button>
          )}
        </div>
      ))}
    </div>
  );
}


import { useEffect, useState } from "react";

import {
  convertObjToArray,
  convertValuesToNumbers,
  hasDuplicateKeys,
} from "@/utils/reactflowUtils";
import _ from "lodash";
import { cloneDeep } from "lodash";
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
import { NodeDataType, sourceHandleType } from "@/types/flow";
import { OutputFieldType } from "@/types/api";
import { scapedJSONStringfy,scapeJSONParse } from "@/utils/reactflowUtils";
import {Edge} from "reactflow";

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
      handleOnNewValue({ value: [["", "" ]] }, { skipSnapshot: true });
    }
  }, [disabled]);

  // @TODO Recursive Character Text Splitter - the value might be in string format, whereas the InputListComponent specifically requires an array format. To ensure smooth operation and prevent potential errors, it's crucial that we handle the conversion from a string to an array with the string as its element.
  if (typeof value === "string") {
    value = [[OPERANDS[0], value]];
  }

  if (!value) value = [];

  Array.isArray(value) ? value : [[OPERANDS[0], value]];

  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setEdges = useFlowStore((state) => state.setEdges);

  const nodeIndex = nodes.findIndex((n) => n.id === nodeId);

  const nodeData: NodeDataType = nodeIndex !== -1 ? nodes[nodeIndex].data : undefined;

  const isGroupNode: boolean = nodeData?.type === "GroupNode";

  const operandWithNoValueSets = new Set<string>(OPERANDS_WITH_NO_VALUES);

  const handleOperandInputChange = (index, newOperand) => {
    const newInputList = _.cloneDeep(value);
    newInputList[index][0] = newOperand;
    if(operandWithNoValueSets.has(newOperand)){
      newInputList[index][1] = "";
    }
    handleOnNewValue({ value: newInputList });
  };

  const handleValueInputChange = (index, newValue) => {
    const newInputList = _.cloneDeep(value);
    newInputList[index][1] = newValue;
    handleOnNewValue({ value: newInputList });
  };

  const addNewInput = (e) => {
    e.preventDefault();
    const newInputList = _.cloneDeep(value);
    newInputList.push([OPERANDS[0], ""]);
    if (nodeData?.node?.outputs && nodeData?.node?.outputs?.length>0) {
      const newOutput: OutputFieldType = _.cloneDeep(nodeData?.node?.outputs[0]);
      newOutput.name = `Condition_${nodeData.node.outputs.length}`;
      newOutput.display_name = newOutput.name
      newOutput.hidden = false
      nodeData.node.outputs.push(newOutput);
      if (handleNodeClass){
        handleNodeClass({ value: nodeData.node });
        setEdges(edges);
      }
    }
    handleOnNewValue({ value: newInputList });
  };

  const removeInput = (index, e) => {
    e.preventDefault();
    const newInputList = _.cloneDeep(value);
    newInputList.splice(index, 1);
    if (nodeData?.node?.outputs && nodeData?.node?.outputs?.length > (index+1)) {
      const newNode = nodeData.node; //_.cloneDeep(nodeData?.node);
      const handleName = `Condition_${index+1}`;

      const handleId: sourceHandleType = {
        id: nodeData.id,
        name: nodeData.node.outputs[index+1].name,
        output_types: nodeData.node.outputs[index+1].types,
        dataType: nodeData.type,
      };
      const handleIdStr: string = scapedJSONStringfy(handleId);
      
      const otherEdges = edges.filter((e) => e.source !== nodeId);
      const affectedEdges = edges.filter((e) => e.source === nodeId && e.sourceHandle !== handleIdStr);
      const modifiedEdges: Edge[] = [];

      if(newNode?.outputs){
        newNode.outputs.splice(index + 1, 1);
        for(let i=index+1; i<newNode?.outputs?.length; i++){

          const tmpHandleId: sourceHandleType = {
            id: nodeData.id,
            name: nodeData.node.outputs[i].name,
            output_types: nodeData.node.outputs[i].types,
            dataType: nodeData.type,
          };
          const tmpHandleIdStr: string = scapedJSONStringfy(tmpHandleId);

          const affectedEdgeIndex = affectedEdges.findIndex((e) => e.sourceHandle === tmpHandleIdStr);
          
          const aModEdge = affectedEdgeIndex!==-1 ? affectedEdges[affectedEdgeIndex] : undefined;
          if(affectedEdgeIndex!==-1){
            affectedEdges.splice(affectedEdgeIndex, 1);
          }

          newNode.outputs[i].name = `Condition_${i}`;
          newNode.outputs[i].display_name = newNode.outputs[i].name;
          if(aModEdge){
            const tmpHandleId2: sourceHandleType = {
              id: nodeData.id,
              name: nodeData.node.outputs[i].name,
              output_types: nodeData.node.outputs[i].types,
              dataType: nodeData.type,
            };
            const tmpHandleIdStr2: string = scapedJSONStringfy(tmpHandleId2);
            
            aModEdge.sourceHandle = tmpHandleIdStr2;
            if(aModEdge.data){
              aModEdge.data.sourceHandle = tmpHandleId2;
            }
            modifiedEdges.push(aModEdge);
          }
        }
      }
      if (handleNodeClass){
        handleNodeClass({ value: newNode });
      }
      nodeData.node.outputs = newNode.outputs;
      setEdges([
        ...otherEdges,
        ...affectedEdges,
        ...modifiedEdges
      ]);
      
    }
    handleOnNewValue({ value: newInputList });
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
        value.length > 1 && editNode ? "mx-2 my-1" : "",
        "flex w-full flex-col gap-3",
      )}
    >
      <div key={`x`} className="flex w-full gap-2">
          <Input
            disabled={true}
            type="text"
            value="No Match"
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
      {value.map((singleValue, index) => (
        <div key={index} className="flex w-full gap-2">
          <Dropdown
            disabled={disabled}
            editNode={editNode}
            options={OPERANDS}
            onSelect={(selectedValue) => handleOperandInputChange(index, selectedValue)}
            combobox={true}
            value={singleValue[0]}
            id={`dropdown_operand_${id}_${index}`}
          />
          <Input
            disabled={disabled || operandWithNoValueSets.has(singleValue[0])}
            type="text"
            value={singleValue[1]}
            className={editNode ? "input-edit-node" : ""}
            placeholder="Type something..."
            onChange={(event) => handleValueInputChange(index, event.target.value)}
            data-testid={`value_${id}_${index}`}
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

/* 

  const getInputClassName = (isEditNode) => {
    return `${isEditNode ? "input-edit-node" : ""} `.trim();
  };

  const getTestId = (prefix, index) =>
    `${editNode ? "editNode" : ""}${prefix}${index}`;

  return (
    <div
      className={`flex h-full flex-col gap-3 ${values?.length > 1 && editNode ? "mx-2 my-1" : ""}`}
    >
      {values?.map((obj, index) =>
        Object.keys(obj).map((key, idx) => (
          <div key={idx} className="flex w-full gap-2">
            <Input
              data-testid={getTestId("keypair", index)}
              id={getTestId("keypair", index)}
              type="text"
              value={key.trim()}
              className={getInputClassName(editNode, duplicateKey)}
              placeholder="Type key..."
              onChange={(event) => handleChangeKey(event, index)}
            />

            <Input
              data-testid={getTestId("keypair", index + 100)}
              id={getTestId("keypair", index + 100)}
              type="text"
              disabled={disabled}
              value={obj[key]}
              className={editNode ? "input-edit-node" : ""}
              placeholder="Type a value..."
              onChange={(event) => handleChangeValue(event, index)}
            />

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
  ); */
}

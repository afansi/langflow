import InputComponent from "@/components/inputComponent";
import ShadTooltip from "@/components/shadTooltipComponent";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import useFlowStore from "@/stores/flowStore";
import { useEffect, useState } from "react";
import useAlertStore from "@/stores/alertStore";

export default function ConditionName({
  display_name,
  selected,
  nodeId,
  checkUniqueness,
  isWithinGroupNode,
  updateState,
}: {
  display_name?: string;
  selected: boolean;
  nodeId: string;
  checkUniqueness: (condName: string) => boolean;
  isWithinGroupNode: boolean;
  updateState: (condName: string) => void;
}) {
  const [inputName, setInputName] = useState(false);
  const [nodeName, setNodeName] = useState(display_name);
  //const takeSnapshot = useFlowsManagerStore((state) => state.takeSnapshot);
  const setNode = useFlowStore((state) => state.setNode);
  const nodes = useFlowStore((state) => state.nodes);
  useEffect(() => {
    if (!selected) {
      setInputName(false);
    }
  }, [selected]);

  useEffect(() => {
    setNodeName(display_name);
  }, [display_name]);

  return inputName ? (
    <div className="w-full">
      <InputComponent
        onBlur={() => {
          setInputName(false);
          if (nodeName!==undefined && nodeName!==null && (!/\s/g.test(nodeName)) && (/^[A-Za-z][A-Za-z0-9_]*$/.test(nodeName)) && nodeName?.trim() !== "" && checkUniqueness(nodeName)) {
            setNodeName(nodeName);
            updateState(nodeName);
            
          } else {
            setNodeName(display_name);
            if(display_name?.toLowerCase()!==nodeName?.toLowerCase()){
              useAlertStore.getState().setNoticeData({
                title: "Invalid name or name has already been used.",
              });
            }
          }
        }}
        value={nodeName}
        autoFocus
        onChange={setNodeName}
        password={false}
        blurOnEnter={true}
        id={`input-condition-${display_name}`}
      />
    </div>
  ) : (
    <div className="group flex w-full items-center gap-1">
      {!isWithinGroupNode && <ShadTooltip content={display_name}>
        <div
          onDoubleClick={(event) => {
            setInputName(true);
            //takeSnapshot();
            event.stopPropagation();
            event.preventDefault();
          }}
          data-testid={"condition-" + display_name}
          className="nodoubleclick w-full cursor-text truncate text-primary"
        >
          {display_name}
        </div>
      </ShadTooltip>
      }
      {isWithinGroupNode && <ShadTooltip content={display_name}>
        <div
          data-testid={"condition-" + display_name}
          className="nodoubleclick w-full cursor-text truncate text-primary"
        >
          {display_name}
        </div>
      </ShadTooltip>
      }      
    </div>
  );
}

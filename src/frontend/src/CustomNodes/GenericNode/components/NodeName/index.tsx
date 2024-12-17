import InputComponent from "@/components/inputComponent";
import ShadTooltip from "@/components/shadTooltipComponent";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import useFlowStore from "@/stores/flowStore";
import { useEffect, useState } from "react";
import useAlertStore from "@/stores/alertStore";
import {getAllNodeDisplayIds} from "@/utils/reactflowUtils";

export default function NodeName({
  display_name,
  selected,
  nodeId,
  display_id,
}: {
  display_name?: string;
  display_id?: string;
  selected: boolean;
  nodeId: string;
}) {
  const [inputName, setInputName] = useState(false);
  const [nodeName, setNodeName] = useState(display_name);
  const [inputDisplay, setInputDisplay] = useState(false);
  const [nodeDisplay, setNodeDisplay] = useState(display_id);
  const takeSnapshot = useFlowsManagerStore((state) => state.takeSnapshot);
  const setNode = useFlowStore((state) => state.setNode);
  const nodes = useFlowStore((state) => state.nodes);
  useEffect(() => {
    if (!selected) {
      setInputName(false);
      setInputDisplay(false);
    }
  }, [selected]);

  useEffect(() => {
    setNodeName(display_name);
  }, [display_name]);

  useEffect(() => {
    setNodeDisplay(display_id);
  }, [display_id]);

  const hasDisplayId: boolean = display_id!==undefined && display_id.trim().length > 0;

  return inputName ? (
    <div className="w-full">
      <InputComponent
        onBlur={() => {
          setInputName(false);
          if (nodeName?.trim() !== "") {
            setNodeName(nodeName);
            setNode(nodeId, (old) => ({
              ...old,
              data: {
                ...old.data,
                node: {
                  ...old.data.node,
                  display_name: nodeName,
                },
              },
            }));
          } else {
            setNodeName(display_name);
          }
        }}
        value={nodeName}
        autoFocus
        onChange={setNodeName}
        password={false}
        blurOnEnter={true}
        id={`input-title-${display_name}`}
      />
    </div>
  ) : (
    <div className="group flex w-full items-center gap-1" style={{display: "block" }}>
      <ShadTooltip content={display_name}>
        <div
          onDoubleClick={(event) => {
            setInputName(true);
            takeSnapshot();
            event.stopPropagation();
            event.preventDefault();
          }}
          data-testid={"title-" + display_name}
          className="nodoubleclick w-full cursor-text truncate text-primary"
        >
          {display_name}
        </div>
      </ShadTooltip>
      {hasDisplayId && (
        inputDisplay ? (
          <div className="w-full">
            <InputComponent
              onBlur={() => {
                setInputDisplay(false);
                if (nodeDisplay!==undefined && nodeDisplay!==null && (!/\s/g.test(nodeDisplay)) && (/^[A-Za-z][A-Za-z0-9_]*$/.test(nodeDisplay)) && nodeDisplay?.trim() !== "" && (!getAllNodeDisplayIds(nodes).includes(nodeDisplay.toLowerCase()))) {
                  setNodeDisplay(nodeDisplay);
                  setNode(nodeId, (old) => ({
                    ...old,
                    data: {
                      ...old.data,
                      node: {
                        ...old.data.node,
                        display_id: nodeDisplay,
                      },
                    },
                  }));
                } else {
                  setNodeDisplay(display_id);
                  if(display_id?.toLowerCase()!==nodeDisplay?.toLowerCase()){
                    useAlertStore.getState().setNoticeData({
                      title: "Invalid name or name has already been used.",
                    });
                  }
                }
              }}
              value={nodeDisplay}
              autoFocus
              onChange={setNodeDisplay}
              password={false}
              blurOnEnter={true}
              id={`input-title-id-${display_id}`}
            />
          </div>
        ) : (
          <div className="group flex w-full items-center gap-1">
            <ShadTooltip content={display_id}>
              <div
                onDoubleClick={(event) => {
                  setInputDisplay(true);
                  takeSnapshot();
                  event.stopPropagation();
                  event.preventDefault();
                }}
                data-testid={"title-id" + display_id}
                className="nodoubleclick w-full cursor-text truncate text-primary"
              >
                ({display_id})
              </div>
            </ShadTooltip>
          </div>
        )
      )}
    </div>
  );
}

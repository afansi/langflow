import {
  getLeftHandleId,
  getRightHandleId,
} from "@/CustomNodes/utils/get-handle-id";
import { cloneDeep } from "lodash";
import {
  Connection,
  Edge,
  Node,
  OnSelectionChangeParams,
  ReactFlowJsonObject,
  XYPosition,
} from "reactflow";
import ShortUniqueId from "short-unique-id";
import getFieldTitle from "../CustomNodes/utils/get-field-title";
import {
  INPUT_TYPES,
  IS_MAC,
  LANGFLOW_SUPPORTED_TYPES,
  OUTPUT_TYPES,
  SUCCESS_BUILD,
  specialCharsRegex,
  NODE_DISPLAY_ID_STR,
} from "../constants/constants";
import { DESCRIPTIONS } from "../flow_constants";
import {
  APIClassType,
  APIKindType,
  APIObjectType,
  APITemplateType,
  InputFieldType,
  OutputFieldType,
} from "../types/api";
import {
  FlowType,
  NodeDataType,
  NodeType,
  sourceHandleType,
  targetHandleType,
} from "../types/flow";
import { STARTER_NODE_TYPE, OPERANDS, OPERANDS_WITH_MULTIPLE_ARGUMENTS, NODE_ENTRY_NAME, IMPORT_EXPORT_TALKY_FORMAT} from "../flow_constants";
import {
  addEscapedHandleIdsToEdgesType,
  findLastNodeType,
  generateFlowType,
  unselectAllNodesType,
  updateEdgesHandleIdsType,
} from "../types/utils/reactflowUtils";
import { getLayoutedNodes } from "./layoutUtils";
import { createRandomKey, toTitleCase } from "./utils";
import { GlobalVariable } from "@/types/global_variables";
const uid = new ShortUniqueId();

export function checkChatInput(nodes: Node[]) {
  return nodes.some((node) => node.data.type === "ChatInput");
}

export function checkStarterNode(nodes: Node[]) {
  return nodes.some((node) => node.data.type === STARTER_NODE_TYPE);
}

export function checkEdgesOnStarterNodes(nodes: Node[], edges: Edge[]) {
  const starterIds = nodes.filter(n => n.data.type === STARTER_NODE_TYPE).map(n => n.id);
  if(starterIds.length === 0){
    return false;
  }
  return edges.some((e) => starterIds.includes(e.source) || starterIds.includes(e.target));
}

export function cleanEdges(nodes: NodeType[], edges: Edge[]) {
  let newEdges = cloneDeep(edges);
  edges.forEach((edge) => {
    // check if the source and target node still exists
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    if (!sourceNode || !targetNode) {
      newEdges = newEdges.filter((edg) => edg.id !== edge.id);
      return;
    }
    // check if the source and target handle still exists
    const sourceHandle = edge.sourceHandle; //right
    const targetHandle = edge.targetHandle; //left
    if (targetHandle) {
      const targetHandleObject: targetHandleType = scapeJSONParse(targetHandle);
      const field = targetHandleObject.fieldName;
      const id: targetHandleType = {
        type: targetNode.data.node!.template[field]?.type,
        fieldName: field,
        id: targetNode.data.id,
        inputTypes: targetNode.data.node!.template[field]?.input_types,
      };
      if (targetNode.data.node!.template[field]?.proxy) {
        id.proxy = targetNode.data.node!.template[field]?.proxy;
      }
      if (scapedJSONStringfy(id) !== targetHandle) {
        newEdges = newEdges.filter((e) => e.id !== edge.id);
      }
    }
    if (sourceHandle) {
      const parsedSourceHandle = scapeJSONParse(sourceHandle);
      const name = parsedSourceHandle.name;
      const output = sourceNode.data.node!.outputs?.find(
        (output) => output.name === name,
      );
      if (output) {
        const outputTypes =
          output!.types.length === 1 ? output!.types : [output!.selected!];

        const id: sourceHandleType = {
          id: sourceNode.data.id,
          name: name,
          output_types: outputTypes,
          dataType: sourceNode.data.type,
        };
        if (scapedJSONStringfy(id) !== sourceHandle) {
          newEdges = newEdges.filter((e) => e.id !== edge.id);
        }
      } else {
        newEdges = newEdges.filter((e) => e.id !== edge.id);
      }
    }
  });
  return newEdges;
}

export function detectBrokenEdgesEdges(nodes: NodeType[], edges: Edge[]) {
  function generateAlertObject(sourceNode, targetNode, edge) {
    const targetHandleObject: targetHandleType = scapeJSONParse(
      edge.targetHandle,
    );
    const sourceHandleObject: sourceHandleType = scapeJSONParse(
      edge.sourceHandle,
    );
    const name = sourceHandleObject.name;
    const output = sourceNode.data.node!.outputs?.find(
      (output) => output.name === name,
    );

    return {
      source: {
        nodeDisplayName: sourceNode.data.node!.display_name,
        outputDisplayName: output?.display_name,
      },
      target: {
        displayName: targetNode.data.node!.display_name,
        field:
          targetNode.data.node!.template[targetHandleObject.fieldName]
            ?.display_name,
      },
    };
  }
  let newEdges = cloneDeep(edges);
  let BrokenEdges: {
    source: {
      nodeDisplayName: string;
      outputDisplayName?: string;
    };
    target: {
      displayName: string;
      field: string;
    };
  }[] = [];
  edges.forEach((edge) => {
    // check if the source and target node still exists
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    if (!sourceNode || !targetNode) {
      newEdges = newEdges.filter((edg) => edg.id !== edge.id);
      return;
    }
    // check if the source and target handle still exists
    const sourceHandle = edge.sourceHandle; //right
    const targetHandle = edge.targetHandle; //left
    if (targetHandle) {
      const targetHandleObject: targetHandleType = scapeJSONParse(targetHandle);
      const field = targetHandleObject.fieldName;
      const id: targetHandleType = {
        type: targetNode.data.node!.template[field]?.type,
        fieldName: field,
        id: targetNode.data.id,
        inputTypes: targetNode.data.node!.template[field]?.input_types,
      };
      if (targetNode.data.node!.template[field]?.proxy) {
        id.proxy = targetNode.data.node!.template[field]?.proxy;
      }
      if (scapedJSONStringfy(id) !== targetHandle) {
        newEdges = newEdges.filter((e) => e.id !== edge.id);
        BrokenEdges.push(generateAlertObject(sourceNode, targetNode, edge));
      }
    }
    if (sourceHandle) {
      const parsedSourceHandle = scapeJSONParse(sourceHandle);
      const name = parsedSourceHandle.name;
      const output = sourceNode.data.node!.outputs?.find(
        (output) => output.name === name,
      );
      if (output) {
        const outputTypes =
          output!.types.length === 1 ? output!.types : [output!.selected!];

        const id: sourceHandleType = {
          id: sourceNode.data.id,
          name: name,
          output_types: outputTypes,
          dataType: sourceNode.data.type,
        };
        if (scapedJSONStringfy(id) !== sourceHandle) {
          newEdges = newEdges.filter((e) => e.id !== edge.id);
          BrokenEdges.push(generateAlertObject(sourceNode, targetNode, edge));
        }
      } else {
        newEdges = newEdges.filter((e) => e.id !== edge.id);
        BrokenEdges.push(generateAlertObject(sourceNode, targetNode, edge));
      }
    }
  });
  return BrokenEdges;
}

export function unselectAllNodes({ updateNodes, data }: unselectAllNodesType) {
  let newNodes = cloneDeep(data);
  newNodes.forEach((node: Node) => {
    node.selected = false;
  });
  updateNodes(newNodes!);
}

export function getNumberConnections(
  { source, target, sourceHandle, targetHandle }: Connection,
  nodes: Node[],
  edges: Edge[],
  type: string
) {
 
  let result = 0;
  if(type==="target"){
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].targetHandle === targetHandle) {
        result += 1;
      }
    }
    console.log(" (" + targetHandle + "): " + result.toString() );
  }else if(type==="source"){
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].source===source! && edges[i].sourceHandle === sourceHandle) {
        result += 1;
      }
    }
  }
  //console.log(type + " (" + targetHandle + "): " + result.toString() );
  //console.log(source + " (" + sourceHandle + ")" + " -> " + target + " (" + targetHandle + "): " + result.toString() );
  return result;  
}

export function isValidConnection(
  { source, target, sourceHandle, targetHandle }: Connection,
  nodes: Node[],
  edges: Edge[],
) {
  if (source === target) {
    return false;
  }
  const targetHandleObject: targetHandleType = scapeJSONParse(targetHandle!);
  const sourceHandleObject: sourceHandleType = scapeJSONParse(sourceHandle!);

  let currentTargetHandleNumConnections = edges.filter((e) => e.targetHandle===targetHandle).length;
  let currentSourceHandleNumConnections = edges.filter((e) => e.sourceHandle===sourceHandle).length;

  if (
    targetHandleObject.inputTypes?.some(
      (n) => n === sourceHandleObject.dataType,
    ) ||
    sourceHandleObject.output_types.some(
      (t) =>
        targetHandleObject.inputTypes?.some((n) => n === t) ||
        t === targetHandleObject.type,
    )
  ) {
    let targetNode = nodes.find((node) => node.id === target!)?.data?.node;
    let acceptMultipleEdgeFlag = targetNode?.template[targetHandleObject.fieldName].can_accept_multiple_edges;
    let maxConnections = targetNode?.template[targetHandleObject.fieldName].max_connections;


    let sourceNode = nodes.find((node) => node.id === source!)?.data?.node;
    if(sourceNode){
      let maxSourceConnections = undefined;
      if(sourceNode?.outputs?.length){
        for (let i = 0; i < sourceNode.outputs.length; i++) {
          if (sourceNode.outputs[i].name===sourceHandleObject.name) {
            maxSourceConnections = sourceNode.outputs[i].max_connections;
            break;
          }
        }
      }
      if(maxSourceConnections!==undefined && (currentSourceHandleNumConnections >= maxSourceConnections)){
        return false;
      }
    }

    //console.log("Target:  " + target + " (" + targetHandle + "): " + targetHandleObject.acceptMultipleEdgeFlag + " :: " + acceptMultipleEdgeFlag + " :: " + maxConnections + " :: " + currentTargetHandleNumConnections + " :: " + targetHandleMaxConnections );
    //console.log("Source:  " + source + " (" + sourceHandle + "): " + currentSourceHandleNumConnections + " :: " + sourceHandleMaxConnections );
    if (!targetNode) {
      if ((!edges.find((e) => e.targetHandle === targetHandle)) ) { 
        return true;
      }
    } else if (
      (!targetNode.template[targetHandleObject.fieldName].list &&
        ((!edges.find((e) => e.targetHandle === targetHandle) || (acceptMultipleEdgeFlag && (maxConnections===undefined || currentTargetHandleNumConnections < maxConnections)) ))) ||
      targetNode.template[targetHandleObject.fieldName].list
    ) {
      return true;
    }
  }
  return false;
}

export function removeApiKeys(flow: FlowType): FlowType {
  let cleanFLow = cloneDeep(flow);
  cleanFLow.data!.nodes.forEach((node) => {
    for (const key in node.data.node.template) {
      if (node.data.node.template[key].password) {
        node.data.node.template[key].value = "";
      }
    }
  });
  return cleanFLow;
}

export function updateTemplate(
  reference: APITemplateType,
  objectToUpdate: APITemplateType,
): APITemplateType {
  let clonedObject: APITemplateType = cloneDeep(reference);

  // Loop through each key in the reference object
  for (const key in clonedObject) {
    // If the key is not in the object to update, add it
    if (objectToUpdate[key] && objectToUpdate[key].value) {
      clonedObject[key].value = objectToUpdate[key].value;
    }
    if (
      objectToUpdate[key] &&
      objectToUpdate[key].advanced !== null &&
      objectToUpdate[key].advanced !== undefined
    ) {
      clonedObject[key].advanced = objectToUpdate[key].advanced;
    }
  }
  return clonedObject;
}

export const processFlows = (DbData: FlowType[], skipUpdate = true) => {
  let savedComponents: { [key: string]: APIClassType } = {};
  DbData.forEach(async (flow: FlowType) => {
    try {
      if (!flow.data) {
        return;
      }
      if (flow.data && flow.is_component) {
        (flow.data.nodes[0].data as NodeDataType).node!.display_name =
          flow.name;
        savedComponents[
          createRandomKey(
            (flow.data.nodes[0].data as NodeDataType).type,
            uid.randomUUID(5),
          )
        ] = cloneDeep((flow.data.nodes[0].data as NodeDataType).node!);
        return;
      }
      await processDataFromFlow(flow, !skipUpdate).catch((e) => {
        console.error(e);
      });
    } catch (e) {
      console.error(e);
    }
  });
  return { data: savedComponents, flows: DbData };
};

export const needsLayout = (nodes: NodeType[]) => {
  return nodes.some((node) => !node.position);
};

export async function processDataFromFlow(
  flow: FlowType,
  refreshIds = true,
): Promise<ReactFlowJsonObject | null> {
  let data = flow?.data ? flow.data : null;
  if (data) {
    processFlowEdges(flow);
    //add dropdown option to nodeOutputs
    processFlowNodes(flow);
    //add animation to text type edges
    updateEdges(data.edges);
    // updateNodes(data.nodes, data.edges);
    if (refreshIds) updateIds(data); // Assuming updateIds is defined elsewhere
    // add layout to nodes if not present
    if (needsLayout(data.nodes)) {
      const layoutedNodes = await getLayoutedNodes(data.nodes, data.edges);
      data.nodes = layoutedNodes;
    }
  }
  return data;
}

export function updateIds(
  { edges, nodes }: { edges: Edge[]; nodes: Node[] },
  selection?: { edges: Edge[]; nodes: Node[] },
) {
  let idsMap = {};
  const selectionIds = selection?.nodes.map((n) => n.id);
  if (nodes) {
    nodes.forEach((node: NodeType) => {
      // Generate a unique node ID
      let newId = getNodeId(node.data.type);
      if (selection && !selectionIds?.includes(node.id)) {
        newId = node.id;
      }
      idsMap[node.id] = newId;
      node.id = newId;
      node.data.id = newId;
      // Add the new node to the list of nodes in state
    });
    selection?.nodes.forEach((sNode: NodeType) => {
      let newId = idsMap[sNode.id];
      sNode.id = newId;
      sNode.data.id = newId;
    });
  }
  const concatedEdges = [...edges, ...(selection?.edges ?? [])];
  if (concatedEdges)
    concatedEdges.forEach((edge: Edge) => {
      edge.source = idsMap[edge.source];
      edge.target = idsMap[edge.target];

      const sourceHandleObject: sourceHandleType = scapeJSONParse(
        edge.sourceHandle!,
      );
      edge.sourceHandle = scapedJSONStringfy({
        ...sourceHandleObject,
        id: edge.source,
      });
      if (edge.data?.sourceHandle?.id) {
        edge.data.sourceHandle.id = edge.source;
      }
      const targetHandleObject: targetHandleType = scapeJSONParse(
        edge.targetHandle!,
      );
      edge.targetHandle = scapedJSONStringfy({
        ...targetHandleObject,
        id: edge.target,
      });
      if (edge.data?.targetHandle?.id) {
        edge.data.targetHandle.id = edge.target;
      }
      edge.id = getHandleId(
        edge.source,
        edge.sourceHandle,
        edge.target,
        edge.targetHandle
      );
    });
  return idsMap;
}

export function validateNode(node: NodeType, edges: Edge[]): Array<string> {
  if (!node.data?.node?.template || !Object.keys(node.data.node.template)) {
    return [
      "We've noticed a potential issue with a Component in the flow. Please review it and, if necessary, submit a bug report with your exported flow file. Thank you for your help!",
    ];
  }

  const {
    type,
    node: { template },
  } = node.data;

  const displayName = node.data.node.display_name;

  return Object.keys(template).reduce((errors: Array<string>, t) => {
    if (
      template[t].required &&
      template[t].show &&
      (template[t].value === undefined ||
        template[t].value === null ||
        template[t].value === "") &&
      !edges.some(
        (edge) =>
          (scapeJSONParse(edge.targetHandle!) as targetHandleType).fieldName ===
            t &&
          (scapeJSONParse(edge.targetHandle!) as targetHandleType).id ===
            node.id,
      )
    ) {
      errors.push(
        `${displayName || type} is missing ${getFieldTitle(template, t)}.`,
      );
    } else if (
      template[t].type === "dict" &&
      template[t].required &&
      template[t].show &&
      (template[t].value !== undefined ||
        template[t].value !== null ||
        template[t].value !== "")
    ) {
      if (hasDuplicateKeys(template[t].value))
        errors.push(
          `${displayName || type} (${getFieldTitle(
            template,
            t,
          )}) contains duplicate keys with the same values.`,
        );
      if (hasEmptyKey(template[t].value))
        errors.push(
          `${displayName || type} (${getFieldTitle(
            template,
            t,
          )}) field must not be empty.`,
        );
    }
    return errors;
  }, [] as string[]);
}

export function validateNodes(
  nodes: Node[],
  edges: Edge[],
): // this returns an array of tuples with the node id and the errors
Array<{ id: string; errors: Array<string> }> {
  if (nodes.length === 0) {
    return [
      {
        id: "",
        errors: [
          "No components found in the flow. Please add at least one component to the flow.",
        ],
      },
    ];
  }
  // validateNode(n, edges) returns an array of errors for the node
  const nodeMap = nodes.map((n) => ({
    id: n.id,
    errors: validateNode(n, edges),
  }));
  return nodeMap.filter((n) => n.errors?.length);
}

export function updateEdges(edges: Edge[]) {
  if (edges)
    edges.forEach((edge) => {
      const targetHandleObject: targetHandleType = scapeJSONParse(
        edge.targetHandle!,
      );
      edge.className = "";
    });
}

export function addVersionToDuplicates(flow: FlowType, flows: FlowType[]) {
  const flowsWithoutUpdatedFlow = flows.filter((f) => f.id !== flow.id);

  const existingNames = flowsWithoutUpdatedFlow.map((item) => item.name);
  let newName = flow.name;
  let count = 1;

  while (existingNames.includes(newName)) {
    newName = `${flow.name} (${count})`;
    count++;
  }

  return newName;
}

export function getNodeDisplayIdRecursion(item: NodeType): string[]{

  const result: string[] = [];
  if (item.data?.node?.flow) {
    item.data.node.flow.data!.nodes.forEach((node) => {    
      const nRes = getNodeDisplayIdRecursion(node);
      nRes.forEach((a) => result.push(a));
      
    });
  }
  if(item.data?.node?.display_id){
    result.push(item.data.node.display_id);
  }
  return result;
}

export function addVersionToDisplayIdDuplicates(nodeId:string, type: string, nodes:Node[], displayId?: string) {  
  const nodesWithoutUpdatedNode = nodes.filter((f) => f.id !== nodeId);

  if(displayId===undefined){
    displayId = (type!=="note" && type!=="GroupNode") ? (type==="Starter" ? "starter" : type + "_1") : getNodeId(type==="GroupNode"?"Group":type).replace("-", "_");
  }

  const existingNames = nodesWithoutUpdatedNode.map((node) => {
    return getNodeDisplayIdRecursion(node);
  }).flat(1);

  let newName = displayId;
  let count = 1;

  while (existingNames.includes(newName)) {
    newName = (type!=="note" && type!=="GroupNode") ? `${(type==="Starter" ? "starter" : type)}_${count}`  : getNodeId(type==="GroupNode"?"Group":type).replace("-", "_");
    count++;
  }

  return newName;
}

export function addEscapedHandleIdsToEdges({
  edges,
}: addEscapedHandleIdsToEdgesType): Edge[] {
  let newEdges = cloneDeep(edges);
  newEdges.forEach((edge) => {
    let escapedSourceHandle = edge.sourceHandle;
    let escapedTargetHandle = edge.targetHandle;
    if (!escapedSourceHandle) {
      let sourceHandle = edge.data?.sourceHandle;
      escapedSourceHandle = getRightHandleId(sourceHandle);
      edge.sourceHandle = escapedSourceHandle;
    }
    if (!escapedTargetHandle) {
      let targetHandle = edge.data?.targetHandle;
      escapedTargetHandle = getLeftHandleId(targetHandle);
      edge.targetHandle = escapedTargetHandle;
    }
  });
  return newEdges;
}
export function updateEdgesHandleIds({
  edges,
  nodes,
}: updateEdgesHandleIdsType): Edge[] {
  let newEdges = cloneDeep(edges);
  newEdges.forEach((edge) => {
    const sourceNodeId = edge.source;
    const targetNodeId = edge.target;
    const sourceNode = nodes.find((node) => node.id === sourceNodeId);
    const targetNode = nodes.find((node) => node.id === targetNodeId);
    let source = edge.sourceHandle;
    let target = edge.targetHandle;
    //right
    let newSource: sourceHandleType;
    //left
    let newTarget: targetHandleType;
    if (target && targetNode) {
      let field = target.split("|")[1];
      newTarget = {
        type: targetNode.data.node!.template[field].type,
        fieldName: field,
        id: targetNode.data.id,
        inputTypes: targetNode.data.node!.template[field].input_types,
      };
    }
    if (source && sourceNode) {
      const output_types =
        sourceNode.data.node!.output_types ??
        sourceNode.data.node!.base_classes!;
      newSource = {
        id: sourceNode.data.id,
        output_types,
        dataType: sourceNode.data.type,
        name: output_types.join(" | "),
      };
    }
    edge.sourceHandle = scapedJSONStringfy(newSource!);
    edge.targetHandle = scapedJSONStringfy(newTarget!);
    const newData = {
      sourceHandle: scapeJSONParse(edge.sourceHandle),
      targetHandle: scapeJSONParse(edge.targetHandle),
    };
    edge.data = newData;
  });
  return newEdges;
}

export function updateNewOutput({ nodes, edges }: updateEdgesHandleIdsType) {
  let newEdges = cloneDeep(edges);
  let newNodes = cloneDeep(nodes);
  newEdges.forEach((edge) => {
    if (edge.sourceHandle && edge.targetHandle) {
      let newSourceHandle: sourceHandleType = scapeJSONParse(edge.sourceHandle);
      let newTargetHandle: targetHandleType = scapeJSONParse(edge.targetHandle);
      const id = newSourceHandle.id;
      const sourceNodeIndex = newNodes.findIndex((node) => node.id === id);
      let sourceNode: NodeType | undefined = undefined;
      if (sourceNodeIndex !== -1) {
        sourceNode = newNodes[sourceNodeIndex];
      }

      let intersection;
      //@ts-ignore
      if (newSourceHandle.baseClasses) {
        if (!newSourceHandle.output_types) {
          if (sourceNode?.data.node!.output_types) {
            newSourceHandle.output_types = sourceNode?.data.node!.output_types;
          } else {
            //@ts-ignore
            newSourceHandle.output_types = newSourceHandle.baseClasses;
          }
        }
        //@ts-ignore
        delete newSourceHandle.baseClasses;
      }
      if (newTargetHandle.inputTypes && newTargetHandle.inputTypes.length > 0) {
        //conjuction subtraction
        intersection = newSourceHandle.output_types.filter((type) =>
          newTargetHandle.inputTypes!.includes(type),
        );
      } else {
        intersection = newSourceHandle.output_types.filter(
          (type) => type === newTargetHandle.type,
        );
      }
      const selected = intersection[0];
      newSourceHandle.name = newSourceHandle.output_types.join(" | ");
      newSourceHandle.output_types = [selected];
      if (sourceNode) {
        if (!sourceNode.data.node?.outputs) {
          sourceNode.data.node!.outputs = [];
        }
        const types =
          sourceNode.data.node!.output_types ??
          sourceNode.data.node!.base_classes!;
        if (
          !sourceNode.data.node!.outputs.some(
            (output) => output.selected === selected,
          )
        ) {
          sourceNode.data.node!.outputs.push({
            types,
            selected: selected,
            name: types.join(" | "),
            display_name: types.join(" | "),
          });
        }
      }

      edge.sourceHandle = scapedJSONStringfy(newSourceHandle);
      edge.data.sourceHandle = newSourceHandle;
    }
  });
  return { nodes: newNodes, edges: newEdges };
}

export function handleKeyDown(
  e:
    | React.KeyboardEvent<HTMLInputElement>
    | React.KeyboardEvent<HTMLTextAreaElement>,
  inputValue: string | number | string[] | null | undefined,
  block: string,
) {
  //condition to fix bug control+backspace on Windows/Linux
  if (
    (typeof inputValue === "string" &&
      (e.metaKey === true || e.ctrlKey === true) &&
      e.key === "Backspace" &&
      (inputValue === block ||
        inputValue?.charAt(inputValue?.length - 1) === " " ||
        specialCharsRegex.test(inputValue?.charAt(inputValue?.length - 1)))) ||
    (IS_MAC && e.ctrlKey === true && e.key === "Backspace")
  ) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (e.ctrlKey === true && e.key === "Backspace" && inputValue === block) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export function handleOnlyIntegerInput(
  event: React.KeyboardEvent<HTMLInputElement>,
) {
  if (
    event.key === "." ||
    event.key === "-" ||
    event.key === "," ||
    event.key === "e" ||
    event.key === "E" ||
    event.key === "+"
  ) {
    event.preventDefault();
  }
}

export function getConnectedNodes(
  edge: Edge,
  nodes: Array<NodeType>,
): Array<NodeType> {
  const sourceId = edge.source;
  const targetId = edge.target;
  return nodes.filter((node) => node.id === targetId || node.id === sourceId);
}

export function convertObjToArray(singleObject: object | string, type: string) {
  if (type !== "dict") return [{ "": "" }];
  if (typeof singleObject === "string") {
    singleObject = JSON.parse(singleObject);
  }
  if (Array.isArray(singleObject)) return singleObject;

  let arrConverted: any[] = [];
  if (typeof singleObject === "object") {
    for (const key in singleObject) {
      if (Object.prototype.hasOwnProperty.call(singleObject, key)) {
        const newObj = {};
        newObj[key] = singleObject[key];
        arrConverted.push(newObj);
      }
    }
  }
  return arrConverted;
}

export function convertArrayToObj(arrayOfObjects) {
  if (!Array.isArray(arrayOfObjects)) return arrayOfObjects;

  let objConverted = {};
  for (const obj of arrayOfObjects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        objConverted[key] = obj[key];
      }
    }
  }
  return objConverted;
}

export function hasDuplicateKeys(array) {
  const keys = {};
  // Transforms an empty object into an object array without opening the 'editNode' modal to prevent the flow build from breaking.
  if (!Array.isArray(array)) array = [{ "": "" }];
  for (const obj of array) {
    for (const key in obj) {
      if (keys[key]) {
        return true;
      }
      keys[key] = true;
    }
  }
  return false;
}

export function hasEmptyKey(objArray) {
  // Transforms an empty object into an array without opening the 'editNode' modal to prevent the flow build from breaking.
  if (!Array.isArray(objArray)) objArray = [];
  for (const obj of objArray) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key === "") {
        return true; // Found an empty key
      }
    }
  }
  return false; // No empty keys found
}

export function convertValuesToNumbers(arr) {
  return arr.map((obj) => {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        if (/^\d+$/.test(value)) {
          value = value?.toString().trim();
        }
        newObj[key] =
          value === "" || isNaN(value) ? value.toString() : Number(value);
      }
    }
    return newObj;
  });
}

export function scapedJSONStringfy(json: object): string {
  return customStringify(json).replace(/"/g, "œ");
}
export function scapeJSONParse(json: string): any {
  let parsed = json.replace(/œ/g, '"');
  return JSON.parse(parsed);
}

// this function receives an array of edges and return true if any of the handles are not a json string
export function checkOldEdgesHandles(edges: Edge[]): boolean {
  return edges.some(
    (edge) =>
      !edge.sourceHandle ||
      !edge.targetHandle ||
      !edge.sourceHandle.includes("{") ||
      !edge.targetHandle.includes("{"),
  );
}

export function checkEdgeWithoutEscapedHandleIds(edges: Edge[]): boolean {
  return edges.some(
    (edge) =>
      (!edge.sourceHandle || !edge.targetHandle) && edge.data?.sourceHandle,
  );
}

export function checkOldNodesOutput(nodes: NodeType[]): boolean {
  return nodes.some(
    (node) =>
      node.data.node?.outputs === undefined && node.type === "genericNode",
  );
}

export function customStringify(obj: any): string {
  if (typeof obj === "undefined") {
    return "null";
  }

  if (obj === null || typeof obj !== "object") {
    if (obj instanceof Date) {
      return `"${obj.toISOString()}"`;
    }
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const arrayItems = obj.map((item) => customStringify(item)).join(",");
    return `[${arrayItems}]`;
  }

  const keys = Object.keys(obj).sort();
  const keyValuePairs = keys.map(
    (key) => `"${key}":${customStringify(obj[key])}`,
  );
  return `{${keyValuePairs.join(",")}}`;
}

export function getMiddlePoint(nodes: Node[]) {
  let middlePointX = 0;
  let middlePointY = 0;

  nodes.forEach((node) => {
    middlePointX += node.position.x;
    middlePointY += node.position.y;
  });

  const totalNodes = nodes.length;
  const averageX = middlePointX / totalNodes;
  const averageY = middlePointY / totalNodes;

  return { x: averageX, y: averageY };
}

export function getNodeId(nodeType: string) {
  return nodeType + "-" + uid.randomUUID(5);
}

export function getHandleId(
  source: string,
  sourceHandle: string,
  target: string,
  targetHandle: string,
) {
  return (
    "reactflow__edge-" + source + sourceHandle + "-" + target + targetHandle
  );
}

export function generateFlow(
  selection: OnSelectionChangeParams,
  nodes: Node[],
  edges: Edge[],
  name: string,
): generateFlowType {
  const newFlowData = { nodes, edges, viewport: { zoom: 1, x: 0, y: 0 } };
  /*	remove edges that are not connected to selected nodes on both ends
   */
  newFlowData.edges = edges.filter(
    (edge) =>
      selection.nodes.some((node) => node.id === edge.target) &&
      selection.nodes.some((node) => node.id === edge.source),
  );
  newFlowData.nodes = selection.nodes;

  const newFlow: FlowType = {
    data: newFlowData,
    is_component: false,
    name: name,
    description: "",
    //generating local id instead of using the id from the server, can change in the future
    id: uid.randomUUID(5),
  };
  // filter edges that are not connected to selected nodes on both ends
  // using O(n²) aproach because the number of edges is small
  // in the future we can use a better aproach using a set
  return {
    newFlow,
    removedEdges: edges.filter(
      (edge) =>
        (selection.nodes.some((node) => node.id === edge.target) ||
          selection.nodes.some((node) => node.id === edge.source)) &&
        newFlowData.edges.every((e) => e.id !== edge.id),
    ),
  };
}

export function reconnectEdges(groupNode: NodeType, excludedEdges: Edge[]) {
  if (!groupNode.data.node!.flow) return [];
  let newEdges = cloneDeep(excludedEdges);
  const { nodes, edges } = groupNode.data.node!.flow!.data!;
  const lastNode = findLastNode(groupNode.data.node!.flow!.data!);
  newEdges = newEdges.filter(
    (e) => !(nodes.some((n) => n.id === e.source) && e.source !== lastNode?.id),
  );
  newEdges.forEach((edge) => {
    if (lastNode && edge.source === lastNode.id) {
      edge.source = groupNode.id;
      let newSourceHandle: sourceHandleType = scapeJSONParse(
        edge.sourceHandle!,
      );
      newSourceHandle.id = groupNode.id;
      edge.sourceHandle = scapedJSONStringfy(newSourceHandle);
      edge.data.sourceHandle = newSourceHandle;
    }
    if (nodes.some((node) => node.id === edge.target)) {
      const targetNode = nodes.find((node) => node.id === edge.target)!;
      const targetHandle: targetHandleType = scapeJSONParse(edge.targetHandle!);
      const proxy = { id: targetNode.id, field: targetHandle.fieldName };
      let newTargetHandle: targetHandleType = cloneDeep(targetHandle);
      newTargetHandle.id = groupNode.id;
      newTargetHandle.proxy = proxy;
      edge.target = groupNode.id;
      newTargetHandle.fieldName = targetHandle.fieldName + "_" + targetNode.id;
      edge.targetHandle = scapedJSONStringfy(newTargetHandle);
      edge.data.targetHandle = newTargetHandle;
    }
  });
  return newEdges;
}

export function filterFlow(
  selection: OnSelectionChangeParams,
  setNodes: (update: Node[] | ((oldState: Node[]) => Node[])) => void,
  setEdges: (update: Edge[] | ((oldState: Edge[]) => Edge[])) => void,
) {
  setNodes((nodes) => nodes.filter((node) => !selection.nodes.includes(node)));
  setEdges((edges) => edges.filter((edge) => !selection.edges.includes(edge)));
}

export function findLastNode({ nodes, edges }: findLastNodeType) {
  /*
		this function receives a flow and return the last node
	*/
  let lastNode = nodes.find((n) => !edges.some((e) => e.source === n.id));
  return lastNode;
}

export function updateFlowPosition(NewPosition: XYPosition, flow: FlowType) {
  const middlePoint = getMiddlePoint(flow.data!.nodes);
  let deltaPosition = {
    x: NewPosition.x - middlePoint.x,
    y: NewPosition.y - middlePoint.y,
  };
  return {
    ...flow,
    data: {
      ...flow.data!,
      nodes: flow.data!.nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + deltaPosition.x,
          y: node.position.y + deltaPosition.y,
        },
      })),
    },
  };
}

export function concatFlows(
  flow: FlowType,
  setNodes: (update: Node[] | ((oldState: Node[]) => Node[])) => void,
  setEdges: (update: Edge[] | ((oldState: Edge[]) => Edge[])) => void,
) {
  const { nodes, edges } = flow.data!;
  setNodes((old) => [...old, ...nodes]);
  setEdges((old) => [...old, ...edges]);
}

export function validateSelection(
  selection: OnSelectionChangeParams,
  edges: Edge[],
): Array<string> {
  const clonedSelection = cloneDeep(selection);
  const clonedEdges = cloneDeep(edges);
  //add edges to selection if selection mode selected only nodes
  if (clonedSelection.edges.length === 0) {
    clonedSelection.edges = clonedEdges;
  }

  // get only edges that are connected to the nodes in the selection
  // first creates a set of all the nodes ids
  let nodesSet = new Set(clonedSelection.nodes.map((n) => n.id));
  // then filter the edges that are connected to the nodes in the set
  let connectedEdges = clonedSelection.edges.filter(
    (e) => nodesSet.has(e.source) && nodesSet.has(e.target),
  );
  // add the edges to the selection
  clonedSelection.edges = connectedEdges;

  let errorsArray: Array<string> = [];
  // check if there is more than one node
  if (clonedSelection.nodes.length < 2) {
    errorsArray.push("Please select more than one component");
  }
  if (
    clonedSelection.nodes.some(
      (node) =>
        isInputNode(node.data as NodeDataType) ||
        isOutputNode(node.data as NodeDataType),
    )
  ) {
    errorsArray.push("Select non-input/output components only");
  }

  //chek if starter node
  if (
    clonedSelection.nodes.some(
      (node) => node.data.type == STARTER_NODE_TYPE
    )
  ) {
    errorsArray.push("Select non Starter components only");
  }
  //check if there are two or more nodes with free outputs
  if (
    clonedSelection.nodes.filter(
      (n) => !clonedSelection.edges.some((e) => e.source === n.id),
    ).length > 1
  ) {
    errorsArray.push("Select only one component with free outputs");
  }

  // check if there is any node that does not have any connection
  if (
    clonedSelection.nodes.some(
      (node) =>
        !clonedSelection.edges.some((edge) => edge.target === node.id) &&
        !clonedSelection.edges.some((edge) => edge.source === node.id),
    )
  ) {
    errorsArray.push("Select only connected components");
  }
  return errorsArray;
}
function updateGroupNodeTemplate(template: APITemplateType) {
  /*this function receives a template, iterates for it's items
	updating the visibility of all basic types setting it to advanced true*/
  Object.keys(template).forEach((key) => {
    let type = template[key].type;
    let input_types = template[key].input_types;
    if (
      LANGFLOW_SUPPORTED_TYPES.has(type) &&
      !template[key].required &&
      !input_types
    ) {
      template[key].advanced = true;
    }
    //prevent code fields from showing on the group node
    if (type === "code" && key === "code") {
      template[key].show = false;
    }
  });
  return template;
}
export function mergeNodeTemplates({
  nodes,
  edges,
}: {
  nodes: NodeType[];
  edges: Edge[];
}): APITemplateType {
  /* this function receives a flow and iterate throw each node
		and merge the templates with only the visible fields
		if there are two keys with the same name in the flow, we will update the display name of each one
		to show from which node it came from
	*/
  let template: APITemplateType = {};
  nodes.forEach((node) => {
    let nodeTemplate = cloneDeep(node.data.node!.template);
    Object.keys(nodeTemplate)
      .filter((field_name) => field_name.charAt(0) !== "_")
      .forEach((key) => {
        if (!isTargetHandleConnected(edges, key, nodeTemplate[key], node.id) || ((nodeTemplate[key].can_accept_multiple_edges ?? false) && ((nodeTemplate[key].max_connections ?? 1) > 1))) {
          template[key + "_" + node.id] = nodeTemplate[key];
          template[key + "_" + node.id].proxy = { id: node.id, field: key };
          if (node.type === "groupNode") {
            template[key + "_" + node.id].display_name =
              node.data.node!.flow!.name + " - " + nodeTemplate[key].name;
          } else {
            template[key + "_" + node.id].display_name =
              //data id already has the node name on it
              node.data.node!.display_name + " - " + (
                nodeTemplate[key].display_name
                  ? nodeTemplate[key].display_name
                  : nodeTemplate[key].name
                    ? toTitleCase(nodeTemplate[key].name)
                    : toTitleCase(key)
              );
          }
        }
      });
  });
  return template;
}
export function isTargetHandleConnected(
  edges: Edge[],
  key: string,
  field: InputFieldType,
  nodeId: string,
) {
  /*
		this function receives a flow and a handleId and check if there is a connection with this handle
	*/
  if (!field) return true;
  if (field.proxy) {
    if (
      edges.some(
        (e) =>
          e.targetHandle ===
          scapedJSONStringfy({
            type: field.type,
            fieldName: key,
            id: nodeId,
            proxy: { id: field.proxy!.id, field: field.proxy!.field },
            inputTypes: field.input_types,
          } as targetHandleType),
      )
    ) {
      return true;
    }
  } else {
    if (
      edges.some(
        (e) =>
          e.targetHandle ===
          scapedJSONStringfy({
            type: field.type,
            fieldName: key,
            id: nodeId,
            inputTypes: field.input_types,
          } as targetHandleType),
      )
    ) {
      return true;
    }
  }
  return false;
}

export function generateNodeTemplate(Flow: FlowType) {
  /*
		this function receives a flow and generate a template for the group node
	*/
  let template = mergeNodeTemplates({
    nodes: Flow.data!.nodes,
    edges: Flow.data!.edges,
  });
  updateGroupNodeTemplate(template);
  return template;
}

export function generateOutPutVariablesFromNodeDisplayId(
  output_variables: any,
  node_display_id: string
): any {
  const result = {}
  if(output_variables){
    if(node_display_id===undefined || node_display_id===null || node_display_id.length==0){
      node_display_id = NODE_DISPLAY_ID_STR;
    }
    Object.keys(output_variables).forEach((key:string)=>{
      result[key.replace(NODE_DISPLAY_ID_STR, node_display_id)] = output_variables[key];
    });
  }
  return result;
}

export function getSuggetionListFromOutputVariables(
  nodes: Node[],
  globalVariables?:GlobalVariable[]
): string[] {
  const suggestions: string [] = []
  
  nodes.forEach((n) => {
    if(n.data?.node?.output_variables){
      Object.keys(
        generateOutPutVariablesFromNodeDisplayId(n.data.node.output_variables, n.data.node.display_id)
      ).forEach((key:string)=>{
        suggestions.push(key);
      });
    }
  });
  if (globalVariables){
    globalVariables.forEach((v) => {
      suggestions.push(v.name);
    });
  }
  return suggestions;
}

export function generateNodeFromFlow(
  flow: FlowType,
  groupVariables: any,
  getNodeId: (type: string) => string,
): NodeType {
  const { nodes } = flow.data!;
  const outputNode = cloneDeep(findLastNode(flow.data!));
  const position = getMiddlePoint(nodes);
  let data = cloneDeep(flow);
  const id = getNodeId("groupComponent");
  const newGroupNode: NodeType = {
    data: {
      id,
      type: "GroupNode",
      node: {
        display_name: "Group",
        documentation: "",
        description: "",
        display_id: getNodeId("Group").replace("-", "_"),
        output_variables: groupVariables,
        template: generateNodeTemplate(data),
        flow: data,
        outputs: generateNodeOutputs(data),
      },
    },
    id,
    position,
    type: "genericNode",
  };
  return newGroupNode;
}

function generateNodeOutputs(flow: FlowType) {
  const { nodes, edges } = flow.data!;
  const outputs: Array<OutputFieldType> = [];
  nodes.forEach((node: NodeType) => {
    if (node.data.node?.outputs) {
      const nodeOutputs = node.data.node.outputs;
      nodeOutputs.forEach((output) => {
        //filter outputs that are not connected
        if (
          !edges.some(
            (edge) =>
              edge.source === node.id &&
              (edge.data.sourceHandle as sourceHandleType).name === output.name,
          )
        ) {
          outputs.push(
            cloneDeep({
              ...output,
              proxy: {
                id: node.id,
                name: output.name,
                nodeDisplayName:
                  node.type === "groupNode"? node.data.node!.flow!.name : (node.data.node!.display_name ?? node.data.node!.name),
              },
              name: node.id + "_" + output.name,
              display_name: (node.type === "groupNode"? node.data.node!.flow!.name : node.data.node!.display_name) + " - " + output.display_name,
            }),
          );
        }
      });
    }
  });
  return outputs;
}

export function connectedInputNodesOnHandle(
  nodeId: string,
  handleId: string,
  { nodes, edges }: { nodes: NodeType[]; edges: Edge[] },
) {
  const connectedNodes: Array<{ name: string; id: string; isGroup: boolean }> =
    [];
  // return the nodes connected to the input handle of the node
  const TargetEdges = edges.filter((e) => e.target === nodeId);
  TargetEdges.forEach((edge) => {
    if (edge.targetHandle === handleId) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        if (sourceNode.type === "groupNode") {
          let lastNode = findLastNode(sourceNode.data.node!.flow!.data!);
          while (lastNode && lastNode.type === "groupNode") {
            lastNode = findLastNode(lastNode.data.node!.flow!.data!);
          }
          if (lastNode) {
            connectedNodes.push({
              name: sourceNode.data.node!.flow!.name,
              id: lastNode.id,
              isGroup: true,
            });
          }
        } else {
          connectedNodes.push({
            name: sourceNode.data.type,
            id: sourceNode.id,
            isGroup: false,
          });
        }
      }
    }
  });
  return connectedNodes;
}

export function updateProxyIdsOnTemplate(
  template: APITemplateType,
  idsMap: { [key: string]: string },
) {
  Object.keys(template).forEach((key) => {
    if (template[key].proxy && idsMap[template[key].proxy!.id]) {
      template[key].proxy!.id = idsMap[template[key].proxy!.id];
    }
  });
}

export function updateProxyIdsOnOutputs(
  outputs: OutputFieldType[] | undefined,
  idsMap: { [key: string]: string },
) {
  if (!outputs) return;
  outputs.forEach((output) => {
    if (output.proxy && idsMap[output.proxy.id]) {
      output.proxy.id = idsMap[output.proxy.id];
    }
  });
}

export function updateEdgesIds(
  edges: Edge[],
  idsMap: { [key: string]: string },
) {
  edges.forEach((edge) => {
    let targetHandle: targetHandleType = edge.data.targetHandle;
    if (targetHandle.proxy && idsMap[targetHandle.proxy!.id]) {
      targetHandle.proxy!.id = idsMap[targetHandle.proxy!.id];
    }
    edge.data.targetHandle = targetHandle;
    edge.targetHandle = scapedJSONStringfy(targetHandle);
  });
}

export function processFlowEdges(flow: FlowType) {
  if (!flow.data || !flow.data.edges) return;
  if (checkEdgeWithoutEscapedHandleIds(flow.data.edges)) {
    const newEdges = addEscapedHandleIdsToEdges({ edges: flow.data.edges });
    flow.data.edges = newEdges;
  } else if (checkOldEdgesHandles(flow.data.edges)) {
    const newEdges = updateEdgesHandleIds(flow.data);
    flow.data.edges = newEdges;
  }
}

export function processFlowNodes(flow: FlowType) {
  if (!flow.data || !flow.data.nodes) return;
  if (checkOldNodesOutput(flow.data.nodes)) {
    const { nodes, edges } = updateNewOutput(flow.data);
    flow.data.nodes = nodes;
    flow.data.edges = edges;
  }
}

export function expandGroupNode(
  id: string,
  flow: FlowType,
  template: APITemplateType,
  nodes: Node[],
  edges: Edge[],
  setNodes: (update: Node[] | ((oldState: Node[]) => Node[])) => void,
  setEdges: (update: Edge[] | ((oldState: Edge[]) => Edge[])) => void,
  outputs?: OutputFieldType[],
) {

  let nonAffectedEdges = edges.filter((e) => e.target !== id && e.source !== id);
  let affectedEdges = edges.filter((e) => e.target === id || e.source === id);
  const idsMap = updateIds(flow!.data!);

  updateProxyIdsOnTemplate(template, idsMap);
  
  let flowEdges = affectedEdges; //edges;
  updateEdgesIds(flowEdges, idsMap);

  flowEdges.forEach((edge) => {
    let sourceHandle: sourceHandleType = edge.data.sourceHandle;
    if (sourceHandle.dataType === "GroupNode" && sourceHandle.id === id) {
      let outputName = sourceHandle.name;
      let outputIndex = outputs!.findIndex((o) => o.name === outputName);
      if(outputIndex!==-1 && outputs![outputIndex].proxy){
        let oldId = outputs![outputIndex].proxy.id;
        let oldField = outputs![outputIndex].proxy.name;
        sourceHandle.id = idsMap[oldId];
        sourceHandle.name = oldField;
        let nodeIndex = flow!.data!.nodes.findIndex((n) => n.id === idsMap[oldId]);
        if(nodeIndex !== -1){
          sourceHandle.dataType = flow!.data!.nodes[nodeIndex].data.type;
        }
      }     
    }

    edge.data.sourceHandle = sourceHandle;
    edge.source = sourceHandle.id;
    edge.sourceHandle = scapedJSONStringfy(sourceHandle);


    let targetHandle: targetHandleType = edge.data.targetHandle;
    if (targetHandle.proxy && targetHandle.proxy!.id && targetHandle.id === id) {
      targetHandle.id = targetHandle.proxy!.id;
      targetHandle.fieldName = targetHandle.proxy!.field;

      let nodeIndex = flow!.data!.nodes.findIndex((n) => n.id === targetHandle.proxy!.id);

      const myKey = targetHandle.proxy!.field;

      if(nodeIndex !== -1){
        if (flow!.data!.nodes[nodeIndex].data.node!.template[myKey].proxy) {
          targetHandle.proxy = flow!.data!.nodes[nodeIndex].data.node!.template[myKey].proxy;
        }else{
          delete targetHandle.proxy;
        }
      }else{
        delete targetHandle.proxy;
      }      
    }
    edge.data.targetHandle = targetHandle;
    edge.target = targetHandle.id;
    edge.targetHandle = scapedJSONStringfy(targetHandle);

    edge.id = getHandleId(edge.source, edge.sourceHandle, edge.target, edge.targetHandle!);
  });
  
  const gNodes: NodeType[] = cloneDeep(flow?.data?.nodes!);
  const gEdges = cloneDeep(flow!.data!.edges);
  // //redirect edges to correct proxy node
  // let updatedEdges: Edge[] = [];
  // flowEdges.forEach((edge) => {
  //   let newEdge = cloneDeep(edge);
  //   if (newEdge.target === id) {
  //     const targetHandle: targetHandleType = newEdge.data.targetHandle;
  //     if (targetHandle.proxy) {
  //       let type = targetHandle.type;
  //       let field = targetHandle.proxy.field;
  //       let proxyId = targetHandle.proxy.id;
  //       let inputTypes = targetHandle.inputTypes;
  //       let node: NodeType = gNodes.find((n) => n.id === proxyId)!;
  //       if (node) {
  //         newEdge.target = proxyId;
  //         let newTargetHandle: targetHandleType = {
  //           fieldName: field,
  //           type,
  //           id: proxyId,
  //           inputTypes: inputTypes,
  //         };
  //         if (node.data.node?.flow) {
  //           newTargetHandle.proxy = {
  //             field: node.data.node.template[field].proxy?.field!,
  //             id: node.data.node.template[field].proxy?.id!,
  //           };
  //         }
  //         newEdge.data.targetHandle = newTargetHandle;
  //         newEdge.targetHandle = scapedJSONStringfy(newTargetHandle);
  //       }
  //     }
  //   }
  //   if (newEdge.source === id) {
  //     const lastNode = cloneDeep(findLastNode(flow!.data!));
  //     newEdge.source = lastNode!.id;
  //     let newSourceHandle: sourceHandleType = scapeJSONParse(
  //       newEdge.sourceHandle!,
  //     );
  //     newSourceHandle.id = lastNode!.id;
  //     newEdge.data.sourceHandle = newSourceHandle;
  //     newEdge.sourceHandle = scapedJSONStringfy(newSourceHandle);
  //   }
  //   if (edge.target === id || edge.source === id) {
  //     updatedEdges.push(newEdge);
  //   }
  // });
  //update template values
  Object.keys(template).forEach((key) => {
    if (template[key].proxy) {
      const { field, id } = template[key].proxy!;
      let nodeIndex = gNodes.findIndex((n) => n.id === id);
      if (nodeIndex !== -1) {
        let proxy: { id: string; field: string } | undefined;
        let display_name: string | undefined;
        let show = gNodes[nodeIndex].data.node!.template[field].show;
        let advanced = gNodes[nodeIndex].data.node!.template[field].advanced;
        if (gNodes[nodeIndex].data.node!.template[field].display_name) {
          display_name =
            gNodes[nodeIndex].data.node!.template[field].display_name;
        } else {
          display_name = gNodes[nodeIndex].data.node!.template[field].name;
        }
        if (gNodes[nodeIndex].data.node!.template[field].proxy) {
          proxy = gNodes[nodeIndex].data.node!.template[field].proxy;
        }
        gNodes[nodeIndex].data.node!.template[field] = template[key];
        gNodes[nodeIndex].data.node!.template[field].show = show;
        gNodes[nodeIndex].data.node!.template[field].advanced = advanced;
        gNodes[nodeIndex].data.node!.template[field].display_name =
          display_name;
        // keep the nodes selected after ungrouping
        // gNodes[nodeIndex].selected = false;
        if (proxy) {
          gNodes[nodeIndex].data.node!.template[field].proxy = proxy;
          // update the edges if needed eventually
          gEdges.filter(
            e => e.target===gNodes[nodeIndex].id && e.data?.targetHandle?.fieldName===field
          ).forEach(e => {
            e.data.targetHandle.proxy = proxy;
            e.targetHandle = scapedJSONStringfy(e.data.targetHandle);
            e.id = getHandleId(e.source, e.sourceHandle!, e.target, e.targetHandle!);
          });
        } else {
          delete gNodes[nodeIndex].data.node!.template[field].proxy;
        }
      }
    }
  });
  outputs?.forEach((output) => {
    let nodeIndex = gNodes.findIndex((n) => n.id === output.proxy!.id);
    if (nodeIndex !== -1) {
      if (gNodes[nodeIndex].data.node?.outputs) {
        const nodeOutputIndex = gNodes[nodeIndex].data.node!.outputs!.findIndex(
          (o) => o.name === output.proxy?.name,
        );
        if (nodeOutputIndex !== -1 && output.selected) {
          gNodes[nodeIndex].data.node!.outputs![nodeOutputIndex].selected =
            output.selected;
        }
      }
    }
  });

  // log for debug - make sure all extracted nodes and edges are legit
  /*
  console.log("ExtractedEdges: \n" + JSON.stringify(gEdges));
  console.log("ExtractedNodes: \n" + JSON.stringify(gNodes.map(n=>n.id)));
  console.log("ConformedEdges: \n" + JSON.stringify(gEdges.map((e) => {
    let srcIdx = gNodes.findIndex(n=>n.id===e.data.sourceHandle.id);
    if(srcIdx !== -1 && (gNodes[srcIdx].data.node!.outputs!.findIndex(o => o.name === e.data.sourceHandle.name)!==-1)){
      let dstIdx = gNodes.findIndex(n=>n.id===e.data.targetHandle.id);
      if(dstIdx !== -1 && (e.data.targetHandle.fieldName in gNodes[dstIdx].data.node!.template)){
        let tmpTgtHandle  = scapedJSONStringfy(e.data.targetHandle);
        const targetHandleObject: targetHandleType = scapeJSONParse(e.targetHandle!);
        const field = targetHandleObject.fieldName;
        const id: targetHandleType = {
          type: gNodes[dstIdx].data.node!.template[field]?.type,
          fieldName: field,
          id: gNodes[dstIdx].data.id,
          inputTypes: gNodes[dstIdx].data.node!.template[field]?.input_types,
        };
        if (gNodes[dstIdx].data.node!.template[field]?.proxy) {
          id.proxy = gNodes[dstIdx].data.node!.template[field]?.proxy;
        }
        let vTmp = scapedJSONStringfy(id);
        if (vTmp === e.targetHandle) {
          let tmpSrcHandle  = scapedJSONStringfy(e.data.sourceHandle);
          const parsedSourceHandle = scapeJSONParse(e.sourceHandle!);
          const name = parsedSourceHandle.name;
          const output = gNodes[srcIdx].data.node!.outputs?.find(
            (output) => output.name === name,
          );
          if (output) {
            const outputTypes =
              output!.types.length === 1 ? output!.types : [output!.selected!];

            const id: sourceHandleType = {
              id: gNodes[srcIdx].data.id,
              name: name,
              output_types: outputTypes,
              dataType: gNodes[srcIdx].data.type,
            };
            vTmp = scapedJSONStringfy(id);
            if (vTmp === e.sourceHandle) {
              return true;
            }else{
              console.log("srcErr:\n" + vTmp + "\n"   + tmpSrcHandle + "\n" + e.sourceHandle);
            }
          }
        }else{
          console.log("tgtErr:\n" + vTmp + "\n"  + tmpTgtHandle + "\n" + e.targetHandle);
        }
      }
    }
    return false;
  })));
  */
  
  const filteredNodes = [...nodes.filter((n) => n.id !== id), ...gNodes];
  const filteredEdges = [
    ...nonAffectedEdges,
    ...gEdges,
    ...affectedEdges,
  ];

  setNodes(filteredNodes);
  setEdges(filteredEdges);
}

export function getGroupStatus(
  flow: FlowType,
  ssData: { [key: string]: { valid: boolean; params: string } },
) {
  let status = { valid: true, params: SUCCESS_BUILD };
  const { nodes } = flow.data!;
  const ids = nodes.map((n: NodeType) => n.data.id);
  ids.forEach((id) => {
    if (!ssData[id]) {
      status = ssData[id];
      return;
    }
    if (!ssData[id].valid) {
      status = { valid: false, params: ssData[id].params };
    }
  });
  return status;
}

export function createFlowComponent(
  nodeData: NodeDataType,
  version: string,
): FlowType {
  const flowNode: FlowType = {
    data: {
      edges: [],
      nodes: [
        {
          data: { ...nodeData, node: { ...nodeData.node, official: false } },
          id: nodeData.id,
          position: { x: 0, y: 0 },
          type: "genericNode",
        },
      ],
      viewport: { x: 1, y: 1, zoom: 1 },
    },
    description: nodeData.node?.description || "",
    name: nodeData.node?.display_name || nodeData.type || "",
    id: nodeData.id || "",
    is_component: true,
    last_tested_version: version,
  };
  return flowNode;
}

export function simulateGroupNode(flowData: FlowType, selectedNodes: Node[]): boolean {
  const mySelection: OnSelectionChangeParams = {nodes: selectedNodes, edges: []};
  if (validateSelection(mySelection!, (flowData.data!.edges)).length === 0) {
    const clonedNodes = cloneDeep(flowData.data!.nodes);
    const clonedEdges = cloneDeep(flowData.data!.edges);
    const clonedSelection = cloneDeep(mySelection);
    updateIds({ nodes: clonedNodes, edges: clonedEdges }, clonedSelection!);
    const { newFlow, removedEdges } = generateFlow(
      clonedSelection!,
      clonedNodes,
      clonedEdges,
      "RandomGroup Name " + uid.randomUUID(5),
    );

    let groupVariables = {}
    newFlow?.data?.nodes.forEach((node) => {
      groupVariables = {
        ...groupVariables,
        ...(generateOutPutVariablesFromNodeDisplayId(
              node?.data?.node?.output_variables ?? {}, 
              node?.data?.node?.display_id ?? "")
        )
      };
    });

    const myGroupVariables = {...groupVariables };

    const newGroupNode = generateNodeFromFlow(newFlow, myGroupVariables, getNodeId);

    const myNodes = ([
      ...clonedNodes.filter(
        (oldNodes) =>
          !clonedSelection?.nodes.some(
            (selectionNode) => selectionNode.id === oldNodes.id,
          ),
      ),
      newGroupNode,
    ]);

    flowData.data!["nodes"] = myNodes;

    const alteredEdges: Array<Edge> = [];
    removedEdges.forEach((edge: Edge) => {
      if(newFlow.data?.nodes.some((node) => node.id === edge.target)){
        let targetHandle: targetHandleType = scapeJSONParse(
          edge.targetHandle!,
        );
        let oldFieldName = targetHandle.fieldName;
        let oldTargetId = edge.target;

        targetHandle.id = newGroupNode.id;
        targetHandle.fieldName = oldFieldName + "_" + oldTargetId;
        targetHandle.proxy = { id: oldTargetId, field: oldFieldName }

        edge.target = newGroupNode.id;
        edge.targetHandle = scapedJSONStringfy(targetHandle);

        edge.id = getHandleId(edge.source, edge.sourceHandle!, edge.target, edge.targetHandle);

        if (edge.data?.targetHandle) {
          edge.data.targetHandle = targetHandle;
        }
        
      }else if (newFlow.data?.nodes.some((node) => node.id === edge.source)){
        let sourceHandle: sourceHandleType = scapeJSONParse(
          edge.sourceHandle!,
        );
        let oldName = sourceHandle.name;
        let oldSourceId = edge.source;

        sourceHandle.dataType = "GroupNode";
        sourceHandle.id = newGroupNode.id;
        sourceHandle.name = oldSourceId + "_" + oldName;

        edge.source = newGroupNode.id;
        edge.sourceHandle = scapedJSONStringfy(sourceHandle);

        edge.id = getHandleId(edge.source, edge.sourceHandle, edge.target, edge.targetHandle!);

        if (edge.data?.sourceHandle) {
          edge.data.sourceHandle = sourceHandle;
        }
      }
      alteredEdges.push(edge);
    });

    const myEdges = [
      ...clonedEdges.filter(
        (oldEdge) =>
          !clonedSelection?.nodes.some((node) => node.id === oldEdge.target) &&
        !clonedSelection?.nodes.some((node) => node.id === oldEdge.source),
      ),
      ...alteredEdges,
    ];
    const filteredEdges: Array<Edge> = [];
    const filteredEdgeIdSet: Set<string> = new Set<string>();
    myEdges.forEach((edge: Edge) => {
      if(!filteredEdgeIdSet.has(edge.targetHandle + "#" + edge.sourceHandle)){
        filteredEdges.push(edge);
        filteredEdgeIdSet.add(edge.targetHandle + "#" + edge.sourceHandle);
      }
    });

    flowData.data!["edges"] = filteredEdges;

    return true;
    

  } else {
    return false;
  }
}

export function transformDataToFlowType(data: any, templates: { [char: string]: APIClassType }): any {

  // const templates = useTypesStore.getState().templates;

  if(!("states" in data)){
    return data;
  }

  const flowData: FlowType = {
    data: {
      edges: [],
      nodes: [],
      viewport: { x: 1, y: 1, zoom: 1 },
    },
    description: data?.description ?? "",
    name: data?.name ?? "",
    id: data?.id ?? "",
  };

  const states: any[] = data.states===null? [] : data.states;

  const matchedNodes: any = {};
  const matchedCategories: any = {};
  const stateIdxConditions: any = {};
  const diplayIds2Idx: any = {};
  const allGroups: any[] = [];
  const distinctGroups: string[] = [];
  const groupNodeDisplayIds: any = {};

  // now create the nodes
  states.forEach((s, idx) => {
    const category: string = s?.category ?? "";

    if((category in templates)){
      const nodeId: string = getNodeId(category);

      
      
      matchedNodes[idx] = nodeId;
      matchedCategories[idx] = category;

      const nodeData: NodeDataType = {
        type: category,
        id: nodeId,
        node: cloneDeep(templates[category]),
      };

      const node : NodeType = {
        id: nodeId,
        type: "genericNode",
        position: s?.properties?.offset ?? { x: 0, y: 0 },
        data: nodeData,
      }

      //fill propertie values
      nodeData.node!.display_id = s?.name ?? nodeId;

      const displayId = nodeData.node!.display_id;

      diplayIds2Idx[displayId] = idx;

      if((s?.group ?? []).length > 0){
        const groupVal = s.group.join("@RFlowG@");
        if(!distinctGroups.includes(groupVal)){
          allGroups.push(s.group.toReversed());
          distinctGroups.push(groupVal);
        }
        s.group.forEach(g => {
          if(!(g in groupNodeDisplayIds)){
            groupNodeDisplayIds[g] = [];
          }
          groupNodeDisplayIds[g].push(displayId);
        });
      }

      const nodeTemplate: APITemplateType = nodeData.node!.template;
      Object.keys(nodeTemplate ?? {}).forEach((key) => {
        if(!(key.startsWith("_") || key==="code" || key===NODE_ENTRY_NAME) && ((key in (s?.properties ?? {}) && (key!=="offset")) || (nodeTemplate[key].type === "conditionList"))){
          const keyData: InputFieldType = nodeTemplate[key];
          const keyType: string = keyData.type;

          if(keyType==="dict"){
            const dictValue: any[] = [];
            (s?.properties[key] ?? []).forEach((o) => {
              if(o?.key?.trim()?.length ?? 0 > 0){
                const val : any = {};
                val[o.key.trim()] = o?.value ?? "";
                dictValue.push(val);
              }
            });
            keyData["value"] = dictValue;
            
          }else if (keyType === "parameterList"){
            const paramValue: any[] = [];
            (s?.properties[key] ?? []).forEach((o) => {
              if(o?.key?.trim()?.length ?? 0 > 0){
                const val : any = {};
                val[o.key.trim()] = [o?.value ?? "", o?.jsonFlag ?? false];
                paramValue.push(val);
              }
            });
            keyData["value"] = paramValue;
  
          }else if (keyType === "conditionList"){
            const conditionValue: any[] = [];
            const conditionNames: any = {};
            const outputs = cloneDeep(nodeData.node?.outputs ?? []);
            (s?.transitions ?? []).forEach((o, idx1) => {
              if(o?.event === "Match"){
                const condName: string = o?.conditions[0]?.conditionName ?? "";
                const operand: string = o?.conditions[0]?.operator ?? OPERANDS[0];
                const argValue: string = (o?.conditions[0]?.arguments ?? []).join(",");
                conditionValue.push([condName, operand, argValue]);
                conditionNames[idx1] = condName;
                if(outputs.length > 0){
                  const anOutput = cloneDeep(outputs[0]);
                  anOutput.name = condName;
                  anOutput.display_name = condName;
                  anOutput.hidden = false;

                  outputs.push(anOutput);
                }
              }
            });
            keyData["value"] = conditionValue;
            stateIdxConditions[idx] = conditionNames;
            nodeData.node!.outputs = outputs;
  
          }else if (keyType === "NestedDict"){
            keyData["value"] = s?.properties[key] ?? "{}";
          }else if (keyType === "bool"){
            keyData["value"] = s?.properties[key] ?? false;
          }else{
            keyData["value"] = s?.properties[key] ?? undefined;
          }

        }
      });

      // add node to the flow
      flowData.data?.nodes.push(node);
    }      
  });

  // now create the edges
  states.forEach((s, idx) => {
      if(idx in matchedNodes){
        (s?.transitions ?? []).forEach((o, idx1) => {
          if(o?.next !== null && ((o!.next as string ) in diplayIds2Idx)){
            const edgeData: any = {
              sourceHandle: {
                dataType: matchedCategories[idx],
                id: matchedNodes[idx],
                name: (o?.event === "Match" && (idx in stateIdxConditions) && (idx1 in stateIdxConditions[idx]))?  stateIdxConditions[idx][idx1] : (o!.event as string),
                output_types:
                [
                    "bool"
                ],
              },
              targetHandle: {
                fieldName: NODE_ENTRY_NAME,
                id: matchedNodes[diplayIds2Idx[(o!.next as string )]],
                inputTypes:
                [
                    "bool"
                ],
                type: "other",
              },
            };
            // scapedJSONStringfy
            const edge = {
              source: matchedNodes[idx],
              sourceHandle: scapedJSONStringfy(edgeData.sourceHandle),
              target: matchedNodes[diplayIds2Idx[(o!.next as string )]],
              targetHandle: scapedJSONStringfy(edgeData.targetHandle),
              data: edgeData,
              className: "",
              id: "",
            }
            edge.id = getHandleId(edge.source, edge.sourceHandle, edge.target, edge.targetHandle);

            // add edge to the flow
            flowData.data?.edges.push(edge as Edge);
          }

        });
      }
  });

  // now add the note nodes
  if("notes" in (data?.metadata ?? {})){
    data.metadata.notes.forEach((n, idx) => {
      const nodeId = getNodeId("note");
      const node : NodeType = {
        id: nodeId,
        type: "noteNode",
        position: n?.offset ?? { x: 0, y: 0 },
        data: {
          type: "note",
          id: nodeId,
          node: {
            description: n?.description ?? "",
            display_name: "",
            documentation: "",
            template: {},
            output_variables: {},
            display_id: `note_${idx+1}`,
          },
        },
      };

      // add note nodes to the set of nodes
      flowData.data?.nodes.push(node);
    });
  }

  let groupSimulationOutcome: boolean = true;
  const noGroupingResult = cloneDeep(flowData);
 
  // manage grouping
  allGroups.sort((a, b) => (b?.length??0) - (a?.length??0));
  if(allGroups.length > 0){    
    while(allGroups[0].length > 0 && groupSimulationOutcome){
      let numElts = allGroups[0].length;
      let j = 0;
      let processed: string[] = [];
      while(j<allGroups.length && allGroups[j].length === numElts  && groupSimulationOutcome){
        const aGroup: string = allGroups[j][0];
        if((!processed.includes(aGroup)) && (aGroup in groupNodeDisplayIds)){
          processed.push(aGroup);
          const selectedNodes = flowData.data?.nodes.filter((n) => groupNodeDisplayIds[aGroup].includes(n.data.node.display_id)) ?? [];
          if(selectedNodes.length > 0){
            groupSimulationOutcome = simulateGroupNode(flowData, selectedNodes);
            if(groupSimulationOutcome){
              //add resulting group node in the list of next group
              if(allGroups[j].length > 1  && flowData.data!.nodes.length > 0){
                const nidx = flowData.data!.nodes.length - 1;
                for(let k=1; k<allGroups[j].length; k++){
                  const nextGroup: string = allGroups[j][k]; 
                  if(!(nextGroup in groupNodeDisplayIds)){
                    groupNodeDisplayIds[nextGroup] = [];
                  }
                  groupNodeDisplayIds[nextGroup].push(flowData.data!.nodes[nidx].data.node.display_id);
                }                
              }
            }
          }
        }
        allGroups[j].splice(0, 1);
        j = j + 1;
      }
    }
  }

  return groupSimulationOutcome? flowData: noGroupingResult;

}

export function getDownloadableNodeStates(node: Node, nodes: Node[], edges: Edge[], group: string[]): any[] {
  
  if(node.data.type === "note"){
    return [];
  }

  let outgoingEdges = edges.filter((e) => e.source === node.id);

  let resultStates: any[] = [];
  let groupOutputs: OutputFieldType[] = [];
  let groupFlow: FlowType | undefined  = undefined;


  if(node.data.type === "GroupNode"){

    groupFlow = node?.data?.node?.flow;
    groupOutputs = node?.data?.node?.outputs ?? [];

    let currentGroup: string[] = [
      ...group,
      (node?.data?.node?.display_id ?? "") as string,
    ]

    groupFlow?.data?.nodes.forEach((n)  => {
      let nodeStates: any[] = getDownloadableNodeStates(n, groupFlow?.data?.nodes ?? [], groupFlow?.data?.edges ?? [], currentGroup);
      resultStates = [
        ...resultStates,
        ...nodeStates,
      ];
    });

  }else{

    let myNodeState: any = {};

    myNodeState["id"] = node.id;
    myNodeState["name"] = node?.data?.node?.display_id ?? node.id;
    myNodeState["category"] = node?.data?.type;
    if(group.length > 0){
      myNodeState["group"] = [...group];
    }
    myNodeState["transitions"] = node?.data?.node?.outputs?.map((o) => ({event: o.name, next: null})) ?? [];

    const properties: any = {};

    properties["offset"] = node?.position ?? { x: 0, y: 0 };

    const nodeTemplate: APITemplateType = node?.data?.node?.template;
    Object.keys(nodeTemplate).forEach((key) => {
      if(!(key.startsWith("_") || key==="code" || key===NODE_ENTRY_NAME || key==="offset")){

        const keyData: InputFieldType = nodeTemplate[key];
        const keyType: string = keyData.type;
        if(keyType==="dict"){
          const dictValue: any[] = [];
          (keyData?.value ?? []).forEach((o) => {
            Object.keys(o).forEach((p) => {
              if(p?.trim().length ?? 0 > 0){
                dictValue.push({key: p.trim(), value: o[p]});
              }
            });
          });
          properties[key] = dictValue;
          
        }else if (keyType === "parameterList"){
          const paramValue: any[] = [];
          (keyData?.value ?? []).forEach((o) => {
            Object.keys(o).forEach((p) => {
              if(p?.trim().length ?? 0 > 0){
                paramValue.push({key: p.trim(), value: o[p][0], jsonFlag: o[p][1]});
              }
            });
          });
          properties[key] = paramValue;

        }else if (keyType === "conditionList"){
          const conditionValue: any[] = [];
          (keyData?.value ?? []).forEach((o, idx) => {
            const condName = o[0];
            const operand = o[1];
            const argumentValues: string[] = OPERANDS_WITH_MULTIPLE_ARGUMENTS.includes(operand) ? (o[2] ?? "").split(",") : [o[2]];
            conditionValue.push({conditionName: condName, operator: operand, arguments: argumentValues.map(argv => argv.trim()).filter((v) => v.length > 0)});
            
          });
          myNodeState["conditions"] = conditionValue;

        }else if (keyType === "NestedDict"){
          properties[key] = keyData?.value ?? "{}";
        }else if (keyType === "bool"){
          properties[key] = keyData?.value ?? false;
        }else{
          properties[key] = keyData?.value ?? undefined;
        }
      }
    });


    myNodeState["properties"] = properties;
    resultStates.push(myNodeState);

  }

  outgoingEdges.forEach((edge) => {
    let nodeSourceId = "";
    let nodeSourceField =  "";
    let nodeTargetId = "";
    let nodeTargetField =  "";
    let sourceHandle: sourceHandleType = edge.data.sourceHandle;
    if (sourceHandle.dataType === "GroupNode" && sourceHandle.id === node.id) {
      let outputName = sourceHandle.name;
      let outputIndex = groupOutputs!.findIndex((o) => o.name === outputName);
      if(outputIndex!==-1 && groupOutputs![outputIndex].proxy){
        let proxyId = groupOutputs![outputIndex]!.proxy!.id;
        nodeSourceField = groupOutputs![outputIndex]!.proxy!.name;
        
        let nodeIndex = groupFlow!.data!.nodes.findIndex((n) => n.id === proxyId);          
        if(nodeIndex !== -1){
          let myLocalNode = groupFlow!.data!.nodes[nodeIndex];
          nodeSourceId = myLocalNode.data.id;
          let nodeType = myLocalNode.data.type;
          while (nodeType === "GroupNode"){
            outputIndex = myLocalNode.data.node.outputs.findIndex((o) => o.name === nodeSourceField);
            if(outputIndex!==-1 && myLocalNode.data.node.outputs![outputIndex].proxy){
              proxyId = myLocalNode.data.node.outputs![outputIndex]!.proxy!.id;
              nodeSourceField = myLocalNode.data.node.outputs![outputIndex]!.proxy!.name;

              nodeIndex = myLocalNode.data.node!.flow!.data!.nodes.findIndex((n) => n.id === proxyId);
              if(nodeIndex !== -1){
                myLocalNode = myLocalNode.data.node!.flow!.data!.nodes[nodeIndex];
                nodeSourceId = myLocalNode.data.id;
                nodeType = myLocalNode.data.type;
              }
            }
          }
        }
      }
    }else{
      nodeSourceId = sourceHandle.id;
      nodeSourceField = sourceHandle.name;
    }


    let targetHandle: targetHandleType = edge.data.targetHandle;
    if (targetHandle.proxy && targetHandle.proxy!.id) {
      nodeTargetId = targetHandle.id;
      nodeTargetField = targetHandle.fieldName;

      let nodeIndex = nodes.findIndex((n) => n.id === nodeTargetId);
      if(nodeIndex !== -1){
        let myLocalNode = nodes[nodeIndex];
        while(nodeIndex !== -1 && myLocalNode.data.node!.template[nodeTargetField]?.proxy){
          nodeTargetId = myLocalNode.data.node!.template[nodeTargetField].proxy!.id;
          nodeTargetField = myLocalNode.data.node!.template[nodeTargetField].proxy!.field;

          nodeIndex = myLocalNode.data.node!.flow!.data!.nodes.findIndex((n) => n.id === nodeTargetId);
          if(nodeIndex !== -1){
            myLocalNode = myLocalNode.data.node!.flow!.data!.nodes[nodeIndex];
          }
        }
      }      
    }else{
      nodeTargetId = targetHandle.id;
      nodeTargetField = targetHandle.fieldName;
    }

    let stateIndex = resultStates.findIndex((n) => n.id === nodeSourceId);
    if(stateIndex!==-1){
      let condIndex: number = resultStates[stateIndex].conditions ? resultStates[stateIndex].conditions.findIndex((n) => n.conditionName === nodeSourceField) : -1;
      let transitionIndex = resultStates[stateIndex]["transitions"].findIndex((n) => n.event === nodeSourceField);
      if(transitionIndex!==-1){
        resultStates[stateIndex]["transitions"][transitionIndex]["next"] = nodeTargetId;
        if(resultStates[stateIndex].conditions && condIndex!==-1){          
          resultStates[stateIndex]["transitions"][transitionIndex]["event"] = "Match";
          resultStates[stateIndex]["transitions"][transitionIndex]["conditions"] = [resultStates[stateIndex].conditions[condIndex]];
          
        }
      }
    }
  });

  return resultStates;

}

export function getDownloadableFlowJsonObject(data: ReactFlowJsonObject | null): any{
  let myFlow = {};
  if(data===null){
    return myFlow;
  }
  const states: any[] = [];
  data.nodes.forEach((node) => {
      let nodeStates: any[] = getDownloadableNodeStates(node, data.nodes ?? [], data.edges ?? [], []);
      nodeStates.forEach((s)=>{
        if("conditions" in s){
          delete s.conditions;
        }
        states.push(s);
      });
  });
  for(let idx=0; idx<states.length; idx++){
    for(let j=0; j<states[idx].transitions.length; j++){
      if(states[idx].transitions[j].next!==null){
        let stateIndex = states.findIndex((n) => n.id === states[idx].transitions[j].next);
        if(stateIndex!==-1){
          states[idx].transitions[j].next = states[stateIndex].name;
        }
      }
    }
  }
  for(let idx=0; idx<states.length; idx++){
    if("id" in states[idx]){
      delete states[idx].id;
    }
  }
  myFlow["states"] = states;
  let initalStateIndex = data.nodes?.findIndex((n) => n.data.type === STARTER_NODE_TYPE) ?? -2;
  myFlow["initialState"] = initalStateIndex===-2? "" : data?.nodes[initalStateIndex<0?0:initalStateIndex].data?.node?.display_id ?? "";
  
  let metadata = {};
  const notes: any[] = [];
  data.nodes.filter((n) => n.data.type === "note").forEach((n) => {
    let myNotes = {};
    myNotes["description"] = n.data?.node?.description ?? "";
    myNotes["offset"] = n?.position ?? { x: 0, y: 0 };
    notes.push(myNotes)
  });
  metadata["notes"] = notes;
  myFlow["metadata"] = metadata;

  return myFlow;
}

export function getDownloadableFlow(NodeFLow: FlowType, saveIdFlag: boolean = false): any {

  let myFlow = {};
  myFlow["name"] = NodeFLow?.name ?? "";
  myFlow["description"] = NodeFLow.description;
  if(saveIdFlag){
    myFlow["id"] = NodeFLow.id;
  }
  const stateInfo: any = getDownloadableFlowJsonObject(NodeFLow.data);
  myFlow = {
    ...myFlow,
    ...stateInfo,
  }
  return myFlow;
}

export function downloadNode(NodeFLow: FlowType) {

  const myFlow: any = IMPORT_EXPORT_TALKY_FORMAT? getDownloadableFlow(cloneDeep(NodeFLow)) : NodeFLow; 
  
  const element = document.createElement("a");
  const file = new Blob([JSON.stringify(myFlow)], {
    type: "application/json",
  });
  element.href = URL.createObjectURL(file);
  element.download = `${NodeFLow?.name ?? "node"}.json`;
  element.click();
}

export function downloadNodeOld(NodeFLow: FlowType) {
  const element = document.createElement("a");
  const file = new Blob([JSON.stringify(NodeFLow)], {
    type: "application/json",
  });
  element.href = URL.createObjectURL(file);
  element.download = `${NodeFLow?.name ?? "node"}.json`;
  element.click();
}

export function updateComponentNameAndType(
  data: any,
  component: NodeDataType,
) {}

export function removeFileNameFromComponents(flow: FlowType) {
  flow.data!.nodes.forEach((node: NodeType) => {
    Object.keys(node.data.node!.template).forEach((field) => {
      if (node.data.node?.template[field].type === "file") {
        node.data.node!.template[field].value = "";
      }
    });
    if (node.data.node?.flow) {
      removeFileNameFromComponents(node.data.node.flow);
    }
  });
}

export function removeGlobalVariableFromComponents(flow: FlowType) {
  flow.data!.nodes.forEach((node: NodeType) => {
    Object.keys(node.data.node!.template).forEach((field) => {
      if (node.data?.node?.template[field]?.load_from_db) {
        node.data.node!.template[field].value = "";
        node.data.node!.template[field].load_from_db = false;
      }
    });
    if (node.data.node?.flow) {
      removeGlobalVariableFromComponents(node.data.node.flow);
    }
  });
}

export function typesGenerator(data: APIObjectType) {
  return Object.keys(data)
    .reverse()
    .reduce((acc, curr) => {
      Object.keys(data[curr]).forEach((c: keyof APIKindType) => {
        acc[c] = curr;
        // Add the base classes to the accumulator as well.
        data[curr][c].base_classes?.forEach((b) => {
          acc[b] = curr;
        });
      });
      return acc;
    }, {});
}

export function templatesGenerator(data: APIObjectType) {
  return Object.keys(data).reduce((acc, curr) => {
    Object.keys(data[curr]).forEach((c: keyof APIKindType) => {
      //prevent wrong overwriting of the component template by a group of the same type
      if (!data[curr][c].flow) acc[c] = data[curr][c];
    });
    return acc;
  }, {});
}

export function extractFieldsFromComponenents(data: APIObjectType) {
  const fields = new Set<string>();
  Object.keys(data).forEach((key) => {
    Object.keys(data[key]).forEach((kind) => {
      Object.keys(data[key][kind].template).forEach((field) => {
        if (
          data[key][kind].template[field].display_name &&
          data[key][kind].template[field].show
        )
          fields.add(data[key][kind].template[field].display_name!);
      });
    });
  });
  return fields;
}

export function downloadFlow(
  flow: FlowType,
  flowName: string,
  flowDescription?: string,
) {
  let clonedFlow = cloneDeep(flow);
  removeFileNameFromComponents(clonedFlow);

  const myFlow: any = IMPORT_EXPORT_TALKY_FORMAT? getDownloadableFlow(clonedFlow): clonedFlow;

  // create a data URI with the current flow data
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify({
      ...myFlow,
      name: flowName,
      description: flowDescription,
    }),
  )}`;

  // create a link element and set its properties
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `${flowName && flowName != "" ? flowName : flow.name}.json`;

  // simulate a click on the link element to trigger the download
  link.click();
}

export function downloadFlowOld(
  flow: FlowType,
  flowName: string,
  flowDescription?: string,
) {
  let clonedFlow = cloneDeep(flow);
  removeFileNameFromComponents(clonedFlow);
  // create a data URI with the current flow data
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify({
      ...clonedFlow,
      name: flowName,
      description: flowDescription,
    }),
  )}`;

  // create a link element and set its properties
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `${flowName && flowName != "" ? flowName : flow.name}.json`;

  // simulate a click on the link element to trigger the download
  link.click();
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomDescription(): string {
  return getRandomElement(DESCRIPTIONS);
}

export const createNewFlow = (
  flowData: ReactFlowJsonObject,
  folderId: string,
  flow?: FlowType,
) => {
  return {
    description: flow?.description ?? getRandomDescription(),
    name: flow?.name ? flow.name : "Untitled document",
    data: flowData,
    id: "",
    is_component: flow?.is_component ?? false,
    folder_id: folderId,
    endpoint_name: flow?.endpoint_name ?? undefined,
  };
};

export function isInputNode(nodeData: NodeDataType): boolean {
  return INPUT_TYPES.has(nodeData.type);
}

export function isOutputNode(nodeData: NodeDataType): boolean {
  return OUTPUT_TYPES.has(nodeData.type);
}

export function isInputType(type: string): boolean {
  return INPUT_TYPES.has(type);
}

export function isOutputType(type: string): boolean {
  return OUTPUT_TYPES.has(type);
}

export function updateGroupRecursion(
  groupNode: NodeType,
  edges: Edge[],
  nodes: Node[],
  unavailableFields:
    | {
        [name: string]: string;
      }
    | undefined,
  globalVariablesEntries: string[] | undefined,
) {
  updateGlobalVariables(
    groupNode.data.node,
    unavailableFields,
    globalVariablesEntries,
  );
  if (groupNode.data.node?.flow) {
    groupNode.data.node.flow.data!.nodes.forEach((node) => {
      // Update Display Id
      if(node.data.node){
        node.data.node.display_id = addVersionToDisplayIdDuplicates(groupNode.id, node.data.type, nodes, node.data.node?.display_id);
      }
      if (node.data.node?.flow) {
        updateGroupRecursion(
          node,
          node.data.node.flow.data!.edges,
          nodes,
          unavailableFields,
          globalVariablesEntries,
        );
      }
    });
    let newFlow = groupNode.data.node!.flow;
    const idsMap = updateIds(newFlow.data!);
    updateProxyIdsOnTemplate(groupNode.data.node!.template, idsMap);
    updateProxyIdsOnOutputs(groupNode.data.node.outputs, idsMap);
    let flowEdges = edges;
    updateEdgesIds(flowEdges, idsMap);
  }
}

export function updateGlobalVariables(
  node: APIClassType | undefined,
  unavailableFields:
    | {
        [name: string]: string;
      }
    | undefined,
  globalVariablesEntries: string[] | undefined,
) {
  if (node && node.template) {
    Object.keys(node.template).forEach((field) => {
      if (
        globalVariablesEntries &&
        node!.template[field].load_from_db &&
        !globalVariablesEntries.includes(node!.template[field].value)
      ) {
        node!.template[field].value = "";
        node!.template[field].load_from_db = false;
      }
      if (
        !node!.template[field].load_from_db &&
        node!.template[field].value === "" &&
        unavailableFields &&
        Object.keys(unavailableFields).includes(
          node!.template[field].display_name ?? "",
        )
      ) {
        node!.template[field].value =
          unavailableFields[node!.template[field].display_name ?? ""];
        node!.template[field].load_from_db = true;
      }
    });
  }
}

export function getGroupOutputNodeId(
  flow: FlowType,
  p_name: string,
  p_node_id: string,
) {
  let node: NodeType | undefined = flow.data?.nodes.find(
    (n) => n.id === p_node_id,
  );
  if (!node) return;
  if (node.data.node?.flow) {
    let output = node.data.node.outputs?.find((o) => o.name === p_name);
    if (output && output.proxy) {
      return getGroupOutputNodeId(
        node.data.node.flow,
        output.proxy.name,
        output.proxy.id,
      );
    }
  }
  return { id: node.id, outputName: p_name };
}

export function checkOldComponents({ nodes }: { nodes: any[] }) {
  return nodes.some(
    (node) =>
      node.data.node?.template.code &&
      (node.data.node?.template.code.value as string).includes(
        "(CustomComponent):",
      ),
  );
}

export function someFlowTemplateFields(
  { nodes }: { nodes: NodeType[] },
  validateFn: (field: InputFieldType) => boolean,
): boolean {
  return nodes.some((node) => {
    return Object.keys(node.data.node?.template ?? {}).some((field) => {
      return validateFn((node.data.node?.template ?? {})[field]);
    });
  });
}

export function getCurrentNodeDisplayIds(node: Node): string[] { 
  let result: string[] = [node?.data?.node?.display_id?.toLowerCase() ?? ""];  
  if(node.data.type === "GroupNode"){
    let groupFlow: FlowType | undefined = node?.data?.node?.flow;
    groupFlow?.data?.nodes.forEach((n)  => {
      let nodeDisplayIds: string[] = getCurrentNodeDisplayIds(n);
      result = [
        ...result,
        ...nodeDisplayIds,
      ];
    });
  }  
  return result;  
}

export function getAllNodeDisplayIds(nodes: Node[]): string[]{  
  const displayIds: string[] = [];
  nodes?.forEach((node) => {
      let nodeDisplayIds: string[] = getCurrentNodeDisplayIds(node);
      nodeDisplayIds.forEach((s)=>{
        displayIds.push(s);
      });
  });
  return displayIds;
}

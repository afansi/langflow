import { useMutationFunctionType } from "@/types/api";
import { FlowType } from "@/types/flow";
import { processFlows } from "@/utils/reactflowUtils";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType} from "@/utils/reactflowUtils";
import {useTypesStore} from "@/stores/typesStore";

interface IGetFlow {
  id: string;
}

// add types for error handling and success
export const useGetFlow: useMutationFunctionType<undefined, IGetFlow> = (
  options,
) => {
  const { mutate } = UseRequestProcessor();

  const getFlowFn = async (payload: IGetFlow): Promise<FlowType> => {
    const response = await api.get<any>(
      `${getURL("FLOWS")}/${payload.id}`,
    );

    const flowData: FlowType = !SAVE_LOAD_TALKY_FORMAT ? response.data : transformDataToFlowType(response.data, useTypesStore.getState().templates);

    const flowsArrayToProcess = [flowData];
    const { flows } = processFlows(flowsArrayToProcess);
    return flows[0];
  };

  const mutation = mutate(["useGetFlow"], getFlowFn, options);

  return mutation;
};

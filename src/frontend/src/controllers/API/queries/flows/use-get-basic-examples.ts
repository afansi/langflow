import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useQueryFunctionType } from "@/types/api";
import { FlowType } from "@/types/flow";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType} from "@/utils/reactflowUtils";
import {useTypesStore} from "@/stores/typesStore";

export const useGetBasicExamplesQuery: useQueryFunctionType<
  undefined,
  FlowType[]
> = (options) => {
  const { query } = UseRequestProcessor();
  const setExamples = useFlowsManagerStore((state) => state.setExamples);

  const getBasicExamplesFn = async () => {
    if(SAVE_LOAD_TALKY_FORMAT){
      return await api.get<any[]>(`${getURL("FLOWS")}/basic_examples/`);
    }else{
      return await api.get<FlowType[]>(`${getURL("FLOWS")}/basic_examples/`);
    }
  };

  const responseFn = async () => {
    const { data } = await getBasicExamplesFn();
    let returnData = data;
    if (returnData) {
      if(SAVE_LOAD_TALKY_FORMAT){
        returnData = returnData.map((v) => transformDataToFlowType(v, useTypesStore.getState().templates));
      }
      setExamples(returnData);
    }
    return returnData;
  };

  const queryResult = query(["useGetBasicExamplesQuery"], responseFn, {
    ...options,
  });

  return queryResult;
};

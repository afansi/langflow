import { useMutationFunctionType } from "@/types/api";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { cloneDeep } from "lodash";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType} from "@/utils/reactflowUtils";
import { useTypesStore } from "@/stores/typesStore";

interface IGetDownloadFolders {
  folderId: string;
}

export const useGetDownloadFolders: useMutationFunctionType<
  undefined,
  IGetDownloadFolders
> = (options?) => {
  const { mutate } = UseRequestProcessor();

  const downloadFoldersFn = async (
    data: IGetDownloadFolders,
  ): Promise<void> => {
    const res = await api.get(`${getURL("FOLDERS")}/download/${data.folderId}`);
    const resData = cloneDeep(res.data);
    let returnFlows = resData?.flows;
    if (returnFlows) {
      if(SAVE_LOAD_TALKY_FORMAT){
        returnFlows = returnFlows.map((v) => transformDataToFlowType(v, useTypesStore.getState().templates));
        resData.flows = returnFlows;
      }
    }
    
    return resData;
  };

  const mutation = mutate(
    ["useGetDownloadFolders"],
    downloadFoldersFn,
    options,
  );
  return mutation;
};

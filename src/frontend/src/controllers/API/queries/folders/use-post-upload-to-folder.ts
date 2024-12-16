import { useMutationFunctionType } from "@/types/api";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType} from "@/utils/reactflowUtils";
import { useTypesStore } from "@/stores/typesStore";

interface IPostAddUploadFlowToFolder {
  flows: FormData;
  folderId: string;
}

export const usePostUploadFlowToFolder: useMutationFunctionType<
  undefined,
  IPostAddUploadFlowToFolder
> = (options?) => {
  const { mutate, queryClient } = UseRequestProcessor();

  const uploadFlowToFolderFn = async (
    payload: IPostAddUploadFlowToFolder,
  ): Promise<void> => {
    const res = await api.post(
      `${getURL("FLOWS")}/upload/?folder_id=${encodeURIComponent(payload.folderId)}`,
      payload.flows,
    );
    let returnData = res.data;
    if (returnData) {
      if(SAVE_LOAD_TALKY_FORMAT){
        returnData = returnData.map((v) => transformDataToFlowType(v, useTypesStore.getState().templates));
      }
    }
    return returnData;
  };

  const mutation = mutate(["usePostUploadFlowToFolder"], uploadFlowToFolderFn, {
    ...options,
    onSettled: (res) => {
      queryClient.refetchQueries({
        queryKey: ["useGetFolders"],
      });
      queryClient.refetchQueries({
        queryKey: ["useGetFolder"],
      });
    },
  });

  return mutation;
};

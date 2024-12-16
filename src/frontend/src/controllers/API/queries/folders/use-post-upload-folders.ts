import { useMutationFunctionType } from "@/types/api";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType} from "@/utils/reactflowUtils";
import { useTypesStore } from "@/stores/typesStore";

interface IPostAddUploadFolders {
  formData: FormData;
}

export const usePostUploadFolders: useMutationFunctionType<
  undefined,
  IPostAddUploadFolders
> = (options?) => {
  const { mutate, queryClient } = UseRequestProcessor();

  const uploadFoldersFn = async (
    payload: IPostAddUploadFolders,
  ): Promise<void> => {
    const res = await api.post(
      `${getURL("FOLDERS")}/upload/`,
      payload.formData,
    );
    let returnData = res.data;
    if (returnData) {
      if(SAVE_LOAD_TALKY_FORMAT){
        returnData = returnData.map((v) => transformDataToFlowType(v, useTypesStore.getState().templates));
      }
    }
    return returnData;
  };

  const mutation = mutate(["usePostUploadFolders"], uploadFoldersFn, {
    ...options,
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ["useGetFolders"] });
    },
  });

  return mutation;
};

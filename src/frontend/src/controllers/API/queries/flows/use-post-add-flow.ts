import { useFolderStore } from "@/stores/foldersStore";
import { useMutationFunctionType } from "@/types/api";
import { UseMutationResult } from "@tanstack/react-query";
import { ReactFlowJsonObject } from "reactflow";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";
import { SAVE_LOAD_TALKY_FORMAT} from "@/flow_constants";
import {transformDataToFlowType, getDownloadableFlowJsonObject} from "@/utils/reactflowUtils";
import {useTypesStore} from "@/stores/typesStore";

interface IPostAddFlow {
  name: string;
  data: ReactFlowJsonObject;
  description: string;
  is_component: boolean;
  folder_id: string;
  endpoint_name: string | undefined;
}

export const usePostAddFlow: useMutationFunctionType<
  undefined,
  IPostAddFlow
> = (options?) => {
  const { mutate, queryClient } = UseRequestProcessor();
  const myCollectionId = useFolderStore((state) => state.myCollectionId);

  const postAddFlowFn = async (payload: IPostAddFlow): Promise<any> => {
    const response = await api.post(`${getURL("FLOWS")}/`, {
      name: payload.name,
      data: !SAVE_LOAD_TALKY_FORMAT ? payload.data : getDownloadableFlowJsonObject(payload.data),
      description: payload.description,
      is_component: payload.is_component,
      folder_id: payload.folder_id || null,
      endpoint_name: payload.endpoint_name || null,
    });

    const flowData: any = !SAVE_LOAD_TALKY_FORMAT ? response.data : transformDataToFlowType(response.data, useTypesStore.getState().templates);

    return flowData;
  };

  const mutation: UseMutationResult<IPostAddFlow, any, IPostAddFlow> = mutate(
    ["usePostAddFlow"],
    postAddFlowFn,
    {
      ...options,
      onSettled: (response) => {
        queryClient.refetchQueries({
          queryKey: ["useGetFolder", response.folder_id ?? myCollectionId],
        });
      },
    },
  );

  return mutation;
};

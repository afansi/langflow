import { IMPORT_EXPORT_TALKY_FORMAT} from "../flow_constants";
import {transformDataToFlowType} from "../utils/reactflowUtils";
import {useTypesStore} from "@/stores/typesStore";

export async function getObjectsFromFilelist<T>(files: File[]): Promise<T[]> {
  let objects: T[] = [];
  for (const file of files) {
    let text = await file.text();
    let fileData = await JSON.parse(text);

    // transformation should happen here on fileData to convert talkylabs flows to FlowType structure
    if(IMPORT_EXPORT_TALKY_FORMAT){
      fileData = transformDataToFlowType(fileData, useTypesStore.getState().templates)
    }

    objects.push(fileData as T);
  }
  return objects;
}

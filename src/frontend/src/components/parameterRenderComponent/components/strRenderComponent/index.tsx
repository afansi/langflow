import { InputProps, StrRenderComponentType } from "../../types";
import DropdownComponent from "../dropdownComponent";
import InputGlobalComponent from "../inputGlobalComponent";
import TextAreaComponent from "../textAreaComponent";
import useFlowStore from "../../../../stores/flowStore";

export function StrRenderComponent({
  templateData,
  name,
  ...baseInputProps
}: InputProps<string, StrRenderComponentType>) {
  const { handleOnNewValue, id, disabled, editNode, value } = baseInputProps;

  const nodes = useFlowStore((state) => state.nodes);
  const hasOutputVariables = nodes.some((n) => n.data?.node?.output_variables && Object.keys(n.data?.node?.output_variables).length > 0);

  if (!templateData.options) {
    return templateData.multiline ? (
      <TextAreaComponent
        {...baseInputProps}
        password={templateData.password}
        updateVisibility={() => {
          if (templateData.password !== undefined) {
            handleOnNewValue(
              { password: !templateData.password },
              { skipSnapshot: true },
            );
          }
        }}
        id={`textarea_${id}`}
        isInput={false}
      />
    ) : (
      hasOutputVariables ? (
        <TextAreaComponent
          {...baseInputProps}
          password={templateData.password}
          updateVisibility={() => {
            if (templateData.password !== undefined) {
              handleOnNewValue(
                { password: !templateData.password },
                { skipSnapshot: true },
              );
            }
          }}
          id={"input-" + name}
          isInput={true}
        />
      ) : (
        <InputGlobalComponent
          {...baseInputProps}
          password={templateData.password}
          load_from_db={templateData.load_from_db}
          id={"input-" + name}
        />)
    );
  }

  if (!!templateData.options) {
    return (
      <DropdownComponent
        {...baseInputProps}
        options={templateData.options}
        combobox={templateData.combobox}
      />
    );
  }
}

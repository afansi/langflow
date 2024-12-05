import * as React from "react";
import { cn } from "../../utils/utils";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  password?: boolean;
  editNode?: boolean;
  suggestions?: string[];
  suggestionMinChars?: number;
  isInput?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, password, editNode, suggestions, suggestionMinChars, isInput, ...props }, ref) => {
    
    // https://codepen.io/jukben/pen/bYZqvR
    if(suggestions && suggestions.length > 0){

      if(isInput===undefined){
        isInput = false;
      }

      const textAreaComponent = isInput ? "input" : "textarea";

      const Item = ({ entity: { value } }) => <div className="group flex w-full items-center justify-between"><div className="flex items-center justify-between"><span className="max-w-52 pr-2" style={{wordWrap: "break-word"}}>{`${value}`}</span></div></div>;

      const suggestMinChars = suggestionMinChars ?? 2;

      const suggestionList: { value:string }[] = suggestions.map((x) => { return {value: x}; });

      const triggerKeys: string[] = [];
      suggestions.forEach((sug) => {
          const myKey = sug.length >= suggestMinChars ? sug.substring(0, suggestMinChars) : sug;
          if(myKey && !triggerKeys.includes(myKey.toLowerCase())){
            triggerKeys.push(myKey);
          }
      });

      const trigger = {};
      triggerKeys.forEach((key) => {
        trigger[key] = {
          dataProvider: (token) => {
            return suggestionList.filter(
              (i) => (i.value.toLowerCase().startsWith(key) 
                && i.value.substring(key.length).toLowerCase().includes(token.toLowerCase().substring(key.length - 1))));
          },
          afterWhitespace: true,
          component: Item,
          output: (item, trigger) => item.value
        }
      });

      return (
        <div className="h-full w-full">
          <ReactTextareaAutocomplete
            data-testid="textarea"
            loadingComponent={() => <span>Loading</span>}
            listClassName="max-h-[300px] overflow-y-auto overflow-x-hidden"
            minChar="0"
            className={cn(
              "nopan nodelete nodrag noflow textarea-primary nowheel",
              className,
              password ? "password" : "",
            )}
            ref={ref}
            {...props}
            value={props.value as string}
            onChange={props.onChange}
            trigger={trigger}
            textAreaComponent={textAreaComponent}            
          />
        </div>
      );
    }
    return (
      <div className="h-full w-full">
        <textarea
          data-testid="textarea"
          className={cn(
            "nopan nodelete nodrag noflow textarea-primary nowheel",
            className,
            password ? "password" : "",
          )}
          ref={ref}
          {...props}
          value={props.value as string}
          onChange={props.onChange}
        />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };

import * as React from "react";
import { cn } from "../../utils/utils";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    suggestions?: string[];
    suggestionMinChars?: number;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suggestions, suggestionMinChars, ...props }, ref) => {

    const allowedSuggestedTypes : string[] = ["email", "password", "search", "tel", "text","url"];
    
    // https://codepen.io/jukben/pen/bYZqvR
    if(suggestions && suggestions.length > 0 && (type===undefined || type===null || allowedSuggestedTypes.includes(type))){

      const textAreaComponent = "input";

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
            data-testid=""
            loadingComponent={() => <span>Loading</span>}
            listClassName="max-h-[300px] overflow-y-auto overflow-x-hidden"
            minChar="0"
            className={cn(
              "nopan nodelete nodrag noflow textarea-primary nowheel",
              className,
              (type && type==="password") ? "password" : "",
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
      <input
        data-testid=""
        type={type}
        className={cn("nopan nodelete nodrag noflow primary-input", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

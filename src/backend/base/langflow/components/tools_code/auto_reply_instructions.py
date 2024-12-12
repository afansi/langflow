from langflow.custom import Component
from langflow.io import HandleInput, DropdownInput, IntInput, Output
from langflow.schema import Data
from langflow.template import Input
from langflow.field_typing.range_spec import RangeSpec
import random


class GetAutoReplyInstructionsComponent(Component):
    display_name = "Auto Reply"
    description = "This component allows to execute Auto Reply instructions from an URL link. "
    documentation = "http://docs.langflow.org/components/custom"
    icon = "videotape"
    name = "GetAutoReplyInstructions"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"],
            can_accept_multiple_edges=True,
            max_connections=100,
        ),
        DropdownInput(
            name="method",
            display_name="Method",
            options=["GET", "POST"],
            value="GET",
            info="The HTTP method to use (GET, POST).",
        ),
        Input(
            name="url",
            display_name="URL",
            #field_type="str",
            required=True,
            placeholder="URL link",
            multiline=False,
            info="the URL link.",
            #input_types=["Text"]
        ),
        IntInput(
            name="timeout",
            display_name="Timeout",
            value=14400,
            range_spec=RangeSpec(min=0, max=14400, step=1, step_type="int"),
            info="The timeout to use for the request.",
        ),
        Input(
            name="controlReturnToFlowFromScript",
            display_name="Return to Flow Execution",
            field_type="bool",
            required=False,
            info="Return to the flow execution after executing the Auto Reply instructions.",
            value=False,
            #input_types=["Text"]
        ),
    ]

    outputs = [
        Output(display_name="Return", name="Return", method="build_output_1", max_connections=1),
        Output(display_name="Timeout", name="Timeout", method="build_output_2", max_connections=1),
        Output(display_name="Failed", name="Failed", method="build_output_3", max_connections=1),
    ]

    output_variables = {
    	"{{states.${NODE_DISPLAY_ID}}}" : "dict", 
    }
    
    
    def update_status(self, code: int) -> dict:
        if(self.status is None or (not isinstance(self.status, dict))):
            self.status = {}
        self.status['output_code'] = code
        return self.status

    def build_output_1(self) -> bool:
        self.status = None
        val1 = random.randint(1, 3)
        self.update_status(val1)
        return val1 == 1

    def build_output_2(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 2)

    def build_output_3(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 3)

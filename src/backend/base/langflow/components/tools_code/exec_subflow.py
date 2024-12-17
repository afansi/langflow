# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input, Output
import random


class ExecSubflowComponent(Component):
    display_name = "Execute Subflow"
    description = "Execute Subflow component."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "Workflow"
    name = "ExecSubflow"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"],
            can_accept_multiple_edges=True,
            max_connections=100,
        ),
        Input(
            name="flow",
            display_name="Flow ID",
            #field_type="str",
            required=True,
            placeholder="The ID of the flow containing the subflow",
            multiline=False,
            info="The ID of the flow containing the subflow.",
            #input_types=["Text"]
        ),
        Input(
            name="version",
            display_name="Flow Version",
            #field_type="str",
            required=True,
            placeholder="The flow version",
            multiline=False,
            info="the flow version.",
            #input_types=["Text"]
        ),
        Input(
            name="parameters",
            display_name="Parameters",
            field_type="parameterList",
            required=False,
            placeholder="The flow parameters",
            multiline=False,
            info="the flow parameters. Parameters set here can be referenced in the Subflow as Liquid variables via {{starter.subflow.parent.parameters.<key>}}.",
            is_list=True,
            #input_types=["Dict"]
        ),
        #Input(
        #    name="parse_as_json_flag",
        #    display_name="Parse as Json",
        #    field_type="bool",
        #    required=False,
        #    placeholder="whether to parse params as Json",
        #    info="whether to parse params as Json.",
        #    #input_types=["bool"]
        #),
    ]

    outputs = [
        Output(display_name="Completed", name="Completed", method="build_output_1", max_connections=1),
        Output(display_name="Failed", name="Failed", method="build_output_2", max_connections=1),
    ]

    output_variables = {
    	"{{nodes.${NODE_DISPLAY_ID}}}" : "dict", 
    }
    
    
    def update_status(self, code: int) -> dict:
        if(self.status is None or (not isinstance(self.status, dict))):
            self.status = {}
        self.status['output_code'] = code
        return self.status

    def build_output_1(self) -> bool:
        self.status = None
        val1 = bool(random.getrandbits(1))
        if(val1):
            self.update_status(1)
        else:
            self.update_status(2)
        return val1

    def build_output_2(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 2)


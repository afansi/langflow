# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input, Output
import random


class RunSubflowComponent(Component):
    display_name = "Run Subflow"
    description = "Run Subflow component."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "custom_components"
    name = "RunSubflow"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"]
        ),
        Input(
            name="my_flow_id",
            display_name="Flow ID",
            #field_type="str",
            required=True,
            placeholder="The ID of the flow containing the subflow",
            multiline=False,
            info="The ID of the flow containing the subflow.",
            #input_types=["Text"]
        ),
        Input(
            name="my_flow_version",
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
            field_type="dict",
            required=False,
            placeholder="The flow params",
            multiline=False,
            info="the flow params.",
            is_list=True,
            #input_types=["Dict"]
        ),
        Input(
            name="parse_as_json_flag",
            display_name="Parse as Json",
            field_type="bool",
            required=False,
            placeholder="whether to parse params as Json",
            info="whether to parse params as Json.",
            #input_types=["bool"]
        ),
    ]

    outputs = [
        Output(display_name="Completed", name="completed", method="build_output_1"),
        Output(display_name="Failed", name="failed", method="build_output_2"),
    ]
    
    
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


# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input, Output
import random


class UpdateContextComponent(Component):
    display_name = "Update Context"
    description = "Update context with variables."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "FolderSync"
    name = "UpdateContext"

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
            name="variables",
            display_name="Variables",
            field_type="parameterList",
            required=False,
            placeholder="The variables to be defined",
            multiline=False,
            info="the variable data. Variables set here can be referenced as Liquid variables via {{flow.context.<key>}}.",
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
        Output(display_name="Success", name="Success", method="build_output_1", max_connections=1),
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
        val1 = random.randint(1, 1)
        self.update_status(val1)
        return val1 == 1


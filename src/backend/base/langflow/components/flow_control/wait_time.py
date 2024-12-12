# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input
import random


class WaitTimeComponent(Component):
    display_name = "Wait Time"
    description = "Pauses the flow execution for the specified time"
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "clock"
    name = "WaitTime"

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
            name="duration",
            display_name="Duration",
            field_type="int",
            required=True,
            placeholder="Duration in seconds",
            value=3600,
            info="The amount of time to wait.",
        ),
    ]

    outputs = [
        Output(display_name="Success", name="Success", method="build_output_1", max_connections=1),
    ]

    output_variables = {}
    
    
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


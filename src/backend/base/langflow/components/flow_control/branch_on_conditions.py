# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input
import random


class BranchOnConditionComponent(Component):
    display_name = "Branch On Conditions"
    description = "Routes a flow to a corresponding state on variable comparison."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "split"
    name = "BranchOnCondition"

    inputs = [        
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"]
        ),
        Input(
            name="variable",
            display_name="Variable",
            #field_type="str",
            required=True,
            placeholder="Variable data to test",
            multiline=False,
            info="the variable data to test.",
            #input_types=["Text"]
        ),
        Input(
            name="conditions",
            display_name="Conditions",
            field_type="conditionList", # "dict",
            required=False,
            placeholder="The conditions to be evaluated",
            info="The conditions to be evaluated.",
            is_list=True,
        ),
    ]

    outputs = [
        Output(display_name="No Match", name="NoMatch", method="build_output_1", max_connections=1),
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


# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
import random


class StarterComponent(Component):
    display_name = "Starter"
    description = "Starter component that trigger the flow execution."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "custom_components"
    name = "Starter"

    inputs = [
        # MessageTextInput(name="input_value", display_name="Input Value", value="Hello, World!"),
    ]

    outputs = [
        Output(display_name="Incoming Message", name="incoming_message_event", method="build_output_1", max_connections=1),
        Output(display_name="Incoming Conversation", name="incoming_conversation_event", method="build_output_2", max_connections=1),
        Output(display_name="REST API", name="rest_api_event", method="build_output_3", max_connections=1),
        Output(display_name="SubModule", name="sub_module_envent", method="build_output_4", max_connections=1),
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
        elif bool(random.getrandbits(1)):
            self.update_status(2)
        elif bool(random.getrandbits(1)):
            self.update_status(3)
        elif bool(random.getrandbits(1)):
            self.update_status(4)
        return val1

    def build_output_2(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 2)

    def build_output_3(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 3)

    def build_output_4(self) -> bool:
        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 4)


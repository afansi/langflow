# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input, Output
import random


class SendMessageComponent(Component):
    display_name = "SendMessage"
    description = "Send Message component."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "message-square-more"
    name = "SendMessage"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"]
        ),
        Input(
            name="dest",
            display_name="To",
            #field_type="str",
            required=True,
            placeholder="Recipient of the message",
            multiline=False,
            info="the recipient of the message.",
            #input_types=["Text"]
        ),
        Input(
            name="src",
            display_name="From",
            #field_type="str",
            required=True,
            placeholder="Sender of the message",
            multiline=False,
            info="the sender of the message.",
            #input_types=["Text"]
        ),
        Input(
            name="body_text",
            display_name="Body",
            #field_type="str",
            required=True,
            placeholder="Body of the message",
            multiline=True,
            info="the message body to send.",
            #input_types=["Text"]
        ),
        Input(
            name="media_url",
            display_name="Media URL",
            #field_type="str",
            required=False,
            placeholder="The url of the media",
            multiline=False,
            info="the url of the media to send.",
            #input_types=["Text"]
        ),
        Input(
            name="my_metadata",
            display_name="Metadata",
            #field_type="str",
            required=False,
            placeholder="The message metadata",
            multiline=True,
            info="the messag metadata.",
            #input_types=["Text"]
        ),
        Input(
            name="my_metadata2",
            display_name="Metadata 2",
            field_type="NestedDict", # "dict",
            required=False,
            placeholder="The message metadata",
            multiline=False,
            info="the messag metadata.",
            is_list=True,
            #input_types=["NestedDict"]
        ),
    ]

    outputs = [
        Output(display_name="Sent", name="sent", method="build_output_1", max_connections=1),
        Output(display_name="Failed", name="failed", method="build_output_2", max_connections=1),
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


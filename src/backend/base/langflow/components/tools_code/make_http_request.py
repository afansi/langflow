from langflow.custom import Component
from langflow.io import HandleInput, DropdownInput, IntInput, Output
from langflow.schema import Data
from langflow.template import Input
import random


class MakeHttpRequestComponent(Component):
    display_name = "Make HTTP Request"
    description = "This component allows you to make HTTP requests to one URL. "
    documentation = "http://docs.langflow.org/components/custom"
    icon = "Globe"
    name = "MakeHttpRequest"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"],
            can_accept_multiple_edges: True,
            max_connections: 100,
        ),
        DropdownInput(
            name="method",
            display_name="Method",
            options=["GET", "POST"],
            value="GET",
            info="The HTTP method to use (GET, POST).",
        ),
        Input(
            name="contentType",
            display_name="Content Type",
            #field_type="str",
            required=False,
            placeholder="The content type of the request",
            multiline=False,
            info="The content type of the request.",
            value="application/x-www-form-urlencoded",
            #input_types=["Text"]
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
        Input(
            name="parameters",
            display_name="Parameters",
            field_type="dict",
            required=False,
            placeholder="The request query parameters",
            advanced=False,
            info="The query parameters to send with the request. ",
            is_list=True,
            #input_types=["Text"]
        ),
        Input(
            name="body",
            display_name="Body",
            field_type="NestedDict",
            required=False,
            placeholder="The message metadata",
            advanced=False,
            info="The body to send with the request as a dictionary (for POST). ",
            #input_types=["Text"]
        ),
        Input(
            name="addAPICredentials",
            display_name="Authenticate with TalkyLabs",
            field_type="bool",
            required=False,
            info="Authenticate with TalkyLabs.",
            value=False,
            #input_types=["Text"]
        ),
        Input(
            name="headers",
            display_name="Headers",
            field_type="dict",
            required=False,
            placeholder="The request headers",
            advanced=True,
            info="The headers to send with the request. ",
            is_list=True,
            #input_types=["Text"]
        ),
        IntInput(
            name="timeout",
            display_name="Timeout",
            value=5,
            info="The timeout to use for the request.",
        ),
    ]

    outputs = [
        Output(display_name="Success", name="Success", method="build_output_1", max_connections=1),
        Output(display_name="Failed", name="Failed", method="build_output_2", max_connections=1),
    ]

    output_variables = {
    	"{{states.${NODE_DISPLAY_ID}.statusCode}}" : "int", 
    	"{{states.${NODE_DISPLAY_ID}.body}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.contentType}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.parsedBody}}" : "dict", 
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

# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
from langflow.template import Input, Output
import random


class SendMessageAndWaitResponseComponent(Component):
    display_name = "SendMessageAndWaitResponse"
    description = "Send Message and wait for a response."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "ChatInput"
    name = "SendMessageAndWaitResponse"

    inputs = [
        HandleInput(
            name="entry",
            display_name="Node Entry",
            #field_type="bool", # if uncommented, will put the input entry of the field on the form
            input_types=["bool"]
        ),
        Input(
            name="body",
            display_name="Body",
            #field_type="str",
            required=False,
            placeholder="Body of the message",
            multiline=True,
            info="the message body to send.",
            #input_types=["Text"]
        ),
        Input(
            name="timeout",
            display_name="Timeout",
            field_type="int",
            required=True,
            placeholder="Timeout in seconds",
            value=3600,
            info="The amount of time to wait for a response.",
        ),
        Input(
            name="mediaUrl",
            display_name="Media URL",
            #field_type="str",
            required=False,
            placeholder="The url of the media",
            multiline=False,
            info="the url of the media to send.",
            #input_types=["Text"],
        ),
        Input(
            name="templateId",
            display_name="Template ID",
            #field_type="str",
            required=False,
            placeholder="The template content ID",
            multiline=False,
            advanced=True,
            info="The template content ID.",
            #input_types=["Text"],
        ),
        Input(
            name="templateParameters",
            display_name="Template Parameters",
            field_type="dict", # "dict",
            required=False,
            placeholder="The template parameters",
            multiline=False,
            advanced=True,
            info="template parameters.",
            is_list=True,
            #input_types=["NestedDict"],
        ),
        Input(
            name="dest",
            display_name="To",
            #field_type="str",
            required=True,
            placeholder="Recipient of the message",
            multiline=False,
            info="the recipient of the message.",
            advanced=True,
            value="{{client.channelIdentity}}",
            #input_types=["Text"],
        ),
        Input(
            name="src",
            display_name="From",
            #field_type="str",
            required=True,
            placeholder="Sender of the message",
            multiline=False,
            info="the sender of the message.",
            advanced=True,
            value="{{flow.ingress.entrypoint}}",
            #input_types=["Text"],
        ),
        Input(
            name="configuration",
            display_name="Configuration",
            #field_type="str",
            required=False,
            placeholder="Conversation Configuration ID",
            multiline=False,
            info="The Conversation configuration of this message.",
            advanced=True,
            value="{{starter.message.conversation.configurationId}}",
            #input_types=["Text"],
        ),
        Input(
            name="thread",
            display_name="Thread",
            #field_type="str",
            required=False,
            placeholder="Conversation Thread ID",
            multiline=False,
            info="The Conversation thread of this message.",
            advanced=True,
            value="{{starter.message.conversation.threadId}}",
            #input_types=["Text"],
        ),
        Input(
            name="metadata",
            display_name="Metadata",
            field_type="NestedDict",
            required=False,
            placeholder="The message metadata",
            advanced=True,
            info="the message metadata.",
            #input_types=["Text"],
        ),
        Input(
            name="messagingOptions",
            display_name="Messaging Options",
            field_type="NestedDict",
            required=False,
            placeholder="The messaging options",
            advanced=True,
            info="the messaging options.",
            #input_types=["Text"],
        ),
    ]

    outputs = [
        Output(display_name="Response", name="Response", method="build_output_1", max_connections=1),
        Output(display_name="Timeout", name="Timeout", method="build_output_2", max_connections=1),
        Output(display_name="DeliveryFailure", name="DeliveryFailure", method="build_output_3", max_connections=1),
    ]
    
    output_variables = {
    	"{{states.${NODE_DISPLAY_ID}.sent.body}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.sent.src}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.sent.dest}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.sent.mediaUrl}}" : "list", 
    	"{{states.${NODE_DISPLAY_ID}.sent.mediaUrl0}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.sent.numMedia}}" : "int", 
    	"{{states.${NODE_DISPLAY_ID}.sent.status}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.sent.messageId}}" : "string",     	
    	
    	"{{states.${NODE_DISPLAY_ID}.received.body}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.received.src}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.received.dest}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.received.mediaUrl}}" : "list", 
    	"{{states.${NODE_DISPLAY_ID}.received.mediaUrl0}}" : "string", 
    	"{{states.${NODE_DISPLAY_ID}.received.numMedia}}" : "int", 
    	"{{states.${NODE_DISPLAY_ID}.received.richContent}}" : "dict", 
    	"{{states.${NODE_DISPLAY_ID}.received.messageId}}" : "string", 
    	
    	
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


# from langflow.field_typing import Data
from langflow.custom import Component
from langflow.io import MessageTextInput, Output, HandleInput
from langflow.schema import Data
import random


class StarterComponent(Component):
    display_name = "Starter"
    description = "Starter component that trigger the flow execution."
    documentation: str = "http://docs.langflow.org/components/custom"
    icon = "chevrons-down"
    name = "Starter"

    inputs = [
        # MessageTextInput(name="input_value", display_name="Input Value", value="Hello, World!"),
    ]

    outputs = [
        Output(display_name="Incoming Message", name="IncomingMessage", method="build_output_1", max_connections=1),
        Output(display_name="Incoming Conversation", name="IncomingConversationThread", method="build_output_2", max_connections=1),
        Output(display_name="REST API", name="IncomingAPIRequest", method="build_output_3", max_connections=1),
        Output(display_name="Subflow", name="SubflowRequest", method="build_output_4", max_connections=1),
    ]

    output_variables = {
    	# IncomingAPIRequest, SubflowRequest, IncomingMessage, IncomingConversationThread
    	"{{starter.event}}" : "string", 

	"{{starter.conversation.appletId}}" : "string",
	"{{starter.conversation.threadId}}" : "string",
	"{{starter.conversation.configurationId}}" : "string",
	"{{starter.conversation.body}}" : "string",
	"{{starter.conversation.mediaUrl}}" : "list",
	"{{starter.conversation.mediaUrl0}}" : "string",
	# "{{starter.conversation.mediaUrl1}}" : "string",
	# "{{starter.conversation.mediaUrl2}}" : "string",
	# "{{starter.conversation.mediaUrl3}}" : "string",
	# "{{starter.conversation.mediaUrl4}}" : "string",
	# "{{starter.conversation.mediaUrl5}}" : "string",
	# "{{starter.conversation.mediaUrl6}}" : "string",
	# "{{starter.conversation.mediaUrl7}}" : "string",
	# "{{starter.conversation.mediaUrl8}}" : "string",
	# "{{starter.conversation.mediaUrl9}}" : "string",
	"{{starter.conversation.numMedia}}" : "int",
	"{{starter.conversation.richContent}}" : "dict",
	"{{starter.conversation.ingressId}}" : "string",
	"{{starter.conversation.src}}" : "string",
	"{{starter.conversation.dateCreated}}" : "datetime",

	"{{starter.message.appletId}}" : "string",
	"{{starter.message.messageId}}" : "string",
	"{{starter.message.conversation.threadId}}" : "string",
	"{{starter.message.conversation.configurationId}}" : "string",
	"{{starter.message.body}}" : "string",
	"{{starter.message.mediaUrl}}" : "list",
	"{{starter.message.mediaUrl0}}" : "string",
	# "{{starter.message.mediaUrl1}}" : "string",
	# "{{starter.message.mediaUrl2}}" : "string",
	# "{{starter.message.mediaUrl3}}" : "string",
	# "{{starter.message.mediaUrl4}}" : "string",
	# "{{starter.message.mediaUrl5}}" : "string",
	# "{{starter.message.mediaUrl6}}" : "string",
	# "{{starter.message.mediaUrl7}}" : "string",
	# "{{starter.message.mediaUrl8}}" : "string",
	# "{{starter.message.mediaUrl9}}" : "string",
	"{{starter.message.numMedia}}" : "int",
	"{{starter.message.richContent}}" : "dict",
	"{{starter.message.ingress.channelId}}" : "string",
	"{{starter.message.src}}" : "string",
	"{{starter.message.srcCountry}}" : "string",
	"{{starter.message.dest}}" : "string",
	"{{starter.message.destCountry}}" : "string",
	"{{starter.message.dateCreated}}" : "datetime",

	"{{flow.data}}" : "dict",
	"{{flow.context}}" : "dict",
	"{{flow.ingress.entrypoint}}" : "string",

	"{{client.channelIdentity}}" : "string",
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


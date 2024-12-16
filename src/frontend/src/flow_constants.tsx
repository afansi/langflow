import { FlowType } from "@/types/flow";

/**
 * Starter Type
 * @constant
 */

export const STARTER_NODE_TYPE: string = "Starter";

/**
 * Starter Type
 * @constant
 */

export const STARTER_NODE_VALUE: FlowType = {
  "id": "ab68cb5b-48c1-49d5-a9a6-b76ec9b3de9d",
  "data":
  {
      "nodes":
      [
          {
              "id": "Starter-zzh2C",
              "type": "genericNode",
              "position":
              {
                  "x": 262,
                  "y": 203
              },
              "data":
              {
                  "type": "Starter",
                  "node":
                  {
                    "template":
                    {
                        "_type": "Component",
                        "code":
                        {
                            "type": "code",
                            "required": true,
                            "placeholder": "",
                            "list": false,
                            "show": true,
                            "multiline": true,
                            "value": "# from langflow.field_typing import Data\nfrom langflow.custom import Component\nfrom langflow.io import MessageTextInput, Output, HandleInput\nfrom langflow.schema import Data\nimport random\n\n\nclass StarterComponent(Component):\n    display_name = \"Starter\"\n    description = \"Starter component that trigger the flow execution.\"\n    documentation: str = \"http://docs.langflow.org/components/custom\"\n    icon = \"chevrons-down\"\n    name = \"Starter\"\n\n    inputs = [\n        # MessageTextInput(name=\"input_value\", display_name=\"Input Value\", value=\"Hello, World!\"),\n    ]\n\n    outputs = [\n        Output(display_name=\"Incoming Message\", name=\"IncomingMessage\", method=\"build_output_1\", max_connections=1),\n        Output(display_name=\"Incoming Conversation\", name=\"IncomingConversationThread\", method=\"build_output_2\", max_connections=1),\n        Output(display_name=\"REST API\", name=\"IncomingAPIRequest\", method=\"build_output_3\", max_connections=1),\n        Output(display_name=\"Subflow\", name=\"SubflowRequest\", method=\"build_output_4\", max_connections=1),\n    ]\n\n    output_variables = {\n    \t# IncomingAPIRequest, SubflowRequest, IncomingMessage, IncomingConversationThread\n    \t\"{{starter.event}}\" : \"string\", \n\n\t\"{{starter.conversation.appletId}}\" : \"string\",\n\t\"{{starter.conversation.threadId}}\" : \"string\",\n\t\"{{starter.conversation.configurationId}}\" : \"string\",\n\t\"{{starter.conversation.body}}\" : \"string\",\n\t\"{{starter.conversation.mediaUrl}}\" : \"list\",\n\t\"{{starter.conversation.mediaUrl0}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl1}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl2}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl3}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl4}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl5}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl6}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl7}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl8}}\" : \"string\",\n\t# \"{{starter.conversation.mediaUrl9}}\" : \"string\",\n\t\"{{starter.conversation.numMedia}}\" : \"int\",\n\t\"{{starter.conversation.richContent}}\" : \"dict\",\n\t\"{{starter.conversation.ingressId}}\" : \"string\",\n\t\"{{starter.conversation.src}}\" : \"string\",\n\t\"{{starter.conversation.dateCreated}}\" : \"datetime\",\n\n\t\"{{starter.message.appletId}}\" : \"string\",\n\t\"{{starter.message.messageId}}\" : \"string\",\n\t\"{{starter.message.conversation.threadId}}\" : \"string\",\n\t\"{{starter.message.conversation.configurationId}}\" : \"string\",\n\t\"{{starter.message.body}}\" : \"string\",\n\t\"{{starter.message.mediaUrl}}\" : \"list\",\n\t\"{{starter.message.mediaUrl0}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl1}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl2}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl3}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl4}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl5}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl6}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl7}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl8}}\" : \"string\",\n\t# \"{{starter.message.mediaUrl9}}\" : \"string\",\n\t\"{{starter.message.numMedia}}\" : \"int\",\n\t\"{{starter.message.richContent}}\" : \"dict\",\n\t\"{{starter.message.ingress.channelId}}\" : \"string\",\n\t\"{{starter.message.src}}\" : \"string\",\n\t\"{{starter.message.srcCountry}}\" : \"string\",\n\t\"{{starter.message.dest}}\" : \"string\",\n\t\"{{starter.message.destCountry}}\" : \"string\",\n\t\"{{starter.message.dateCreated}}\" : \"datetime\",\n\n\t\"{{flow.data}}\" : \"dict\",\n\t\"{{flow.context}}\" : \"dict\",\n\t\"{{flow.ingress.entrypoint}}\" : \"string\",\n\n\t\"{{client.channelIdentity}}\" : \"string\",\n    }\n    \n    \n    def update_status(self, code: int) -> dict:\n        if(self.status is None or (not isinstance(self.status, dict))):\n            self.status = {}\n        self.status['output_code'] = code\n        return self.status\n\n    def build_output_1(self) -> bool:\n        self.status = None\n        val1 = bool(random.getrandbits(1))\n        if(val1):\n            self.update_status(1)\n        elif bool(random.getrandbits(1)):\n            self.update_status(2)\n        elif bool(random.getrandbits(1)):\n            self.update_status(3)\n        elif bool(random.getrandbits(1)):\n            self.update_status(4)\n        return val1\n\n    def build_output_2(self) -> bool:\n        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 2)\n\n    def build_output_3(self) -> bool:\n        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 3)\n\n    def build_output_4(self) -> bool:\n        return (self.status and isinstance(self.status, dict) and self.status.get('output_code') == 4)\n\n",
                            "fileTypes":
                            [],
                            "file_path": "",
                            "password": false,
                            "name": "code",
                            "advanced": true,
                            "dynamic": true,
                            "info": "",
                            "load_from_db": false,
                            "title_case": false,
                            "can_accept_multiple_edges": false
                        }
                    },
                    "description": "Starter component that trigger the flow execution.",
                    "icon": "chevrons-down",
                    "base_classes":
                    [
                        "bool"
                    ],
                    "display_name": "Starter",
                    "documentation": "http://docs.langflow.org/components/custom",
                    "custom_fields":
                    {},
                    "output_types":
                    [],
                    "pinned": false,
                    "conditional_paths":
                    [],
                    "frozen": false,
                    "outputs":
                    [
                        {
                            "types":
                            [
                                "bool"
                            ],
                            "selected": "bool",
                            "name": "IncomingMessage",
                            "display_name": "Incoming Message",
                            "method": "build_output_1",
                            "value": "__UNDEFINED__",
                            "cache": true,
                            "max_connections": 1
                        },
                        {
                            "types":
                            [
                                "bool"
                            ],
                            "selected": "bool",
                            "name": "IncomingConversationThread",
                            "display_name": "Incoming Conversation",
                            "method": "build_output_2",
                            "value": "__UNDEFINED__",
                            "cache": true,
                            "max_connections": 1
                        },
                        {
                            "types":
                            [
                                "bool"
                            ],
                            "selected": "bool",
                            "name": "IncomingAPIRequest",
                            "display_name": "REST API",
                            "method": "build_output_3",
                            "value": "__UNDEFINED__",
                            "cache": true,
                            "max_connections": 1
                        },
                        {
                            "types":
                            [
                                "bool"
                            ],
                            "selected": "bool",
                            "name": "SubflowRequest",
                            "display_name": "Subflow",
                            "method": "build_output_4",
                            "value": "__UNDEFINED__",
                            "cache": true,
                            "max_connections": 1
                        }
                    ],
                    "field_order":
                    [],
                    "beta": false,
                    "edited": false,
                    "metadata":
                    {},
                    "output_variables":
                    {
                        "{{starter.event}}": "string",
                        "{{starter.conversation.appletId}}": "string",
                        "{{starter.conversation.threadId}}": "string",
                        "{{starter.conversation.configurationId}}": "string",
                        "{{starter.conversation.body}}": "string",
                        "{{starter.conversation.mediaUrl}}": "list",
                        "{{starter.conversation.mediaUrl0}}": "string",
                        "{{starter.conversation.numMedia}}": "int",
                        "{{starter.conversation.richContent}}": "dict",
                        "{{starter.conversation.ingressId}}": "string",
                        "{{starter.conversation.src}}": "string",
                        "{{starter.conversation.dateCreated}}": "datetime",
                        "{{starter.message.appletId}}": "string",
                        "{{starter.message.messageId}}": "string",
                        "{{starter.message.conversation.threadId}}": "string",
                        "{{starter.message.conversation.configurationId}}": "string",
                        "{{starter.message.body}}": "string",
                        "{{starter.message.mediaUrl}}": "list",
                        "{{starter.message.mediaUrl0}}": "string",
                        "{{starter.message.numMedia}}": "int",
                        "{{starter.message.richContent}}": "dict",
                        "{{starter.message.ingress.channelId}}": "string",
                        "{{starter.message.src}}": "string",
                        "{{starter.message.srcCountry}}": "string",
                        "{{starter.message.dest}}": "string",
                        "{{starter.message.destCountry}}": "string",
                        "{{starter.message.dateCreated}}": "datetime",
                        "{{flow.data}}": "dict",
                        "{{flow.context}}": "dict",
                        "{{flow.ingress.entrypoint}}": "string",
                        "{{client.channelIdentity}}": "string"
                    },
                    "display_id": "starter",
                    "official": false
                  },
                  "id": "Starter-zzh2C",
                  "description": "Starter component that trigger the flow execution.",
                  "display_name": "Starter"
              },
              "selected": true,
              "width": 384,
              "height": 339,
              "dragging": false
          }
      ],
      "edges":
      [],
      "viewport":
      {
          "x": 0,
          "y": 0,
          "zoom": 1
      }
  },
  "description": "Generate, Innovate, Communicate.",
  "name": "Untitled document",
  "endpoint_name": null,
  "is_component": false
};


/**
 * Default description for the flow
 * @constant
 */
export const DESCRIPTIONS: string[] = [
  "Chain the Words, Master Language!",
  "Language Architect at Work!",
  "Empowering Language Engineering.",
  "Craft Language Connections Here.",
  "Create, Connect, Converse.",
  "Smart Chains, Smarter Conversations.",
  "Bridging Prompts for Brilliance.",
  "Language Models, Unleashed.",
  "Your Hub for Text Generation.",
  "Promptly Ingenious!",
  "Building Linguistic Labyrinths.",
  "Create, Chain, Communicate.",
  "Connect the Dots, Craft Language.",
  "Interactive Language Weaving.",
  "Generate, Innovate, Communicate.",
  "Conversation Catalyst Engine.",
  "Language Chainlink Master.",
  "Design Dialogues with Langflow.",
  "Nurture NLP Nodes Here.",
  "Conversational Cartography Unlocked.",
  "Design, Develop, Dialogize.",
  "Unleashing Linguistic Creativity.",
  "Graph Your Way to Great Conversations.",
  "The Power of Language at Your Fingertips.",
  "Sculpting Language with Precision.",
  "Where Language Meets Logic.",
  "Building Intelligent Interactions.",
  "Your Passport to Linguistic Landscapes.",
  "Create, Curate, Communicate with Langflow.",
  "Flow into the Future of Language.",
  "Mapping Meaningful Conversations.",
  "Unravel the Art of Articulation.",
  "Language Engineering Excellence.",
  "Navigate the Networks of Conversation.",
  "Crafting Conversations, One Node at a Time.",
  "The Pinnacle of Prompt Generation.",
  "Language Models, Mapped and Mastered.",
  "Powerful Prompts, Perfectly Positioned.",
  "Innovation in Interaction with Langflow.",
  "Your Toolkit for Text Generation.",
  "Unfolding Linguistic Possibilities.",
  "Building Powerful Solutions with Language Models.",
  "Uncover Business Opportunities with NLP.",
  "Harness the Power of Conversational AI.",
  "Transform Your Business with Smart Dialogues.",
  "Craft Meaningful Interactions, Generate Value.",
  "Unleashing Business Potential through Language Engineering.",
  "Empowering Enterprises with Intelligent Interactions.",
  "Driving Innovation in Business Communication.",
  "Catalyzing Business Growth through Conversational AI.",
  "Text Generation Meets Business Transformation.",
  "Navigate the Linguistic Landscape, Discover Opportunities.",
  "Create Powerful Connections, Boost Business Value.",
  "Empowering Communication, Enabling Opportunities.",
  "Advanced NLP for Groundbreaking Business Solutions.",
  "Innovation in Interaction, Revolution in Revenue.",
  "Maximize Impact with Intelligent Conversations.",
  "Beyond Text Generation - Unleashing Business Opportunities.",
  "Unlock the Power of AI in Your Business Conversations.",
  "Crafting Dialogues that Drive Business Success.",
  "Engineered for Excellence, Built for Business.",
];

/**
 * Adjectives for the name of the flow
 * @constant
 *
 */
export const ADJECTIVES: string[] = [
  "admiring",
  "adoring",
  "agitated",
  "amazing",
  "angry",
  "awesome",
  "backstabbing",
  "berserk",
  "big",
  "boring",
  "clever",
  "cocky",
  "compassionate",
  "condescending",
  "cranky",
  "desperate",
  "determined",
  "distracted",
  "dreamy",
  "drunk",
  "ecstatic",
  "elated",
  "elegant",
  "evil",
  "fervent",
  "focused",
  "furious",
  "gigantic",
  "gloomy",
  "goofy",
  "grave",
  "happy",
  "high",
  "hopeful",
  "hungry",
  "insane",
  "jolly",
  "jovial",
  "kickass",
  "lonely",
  "loving",
  "mad",
  "modest",
  "naughty",
  "nauseous",
  "nostalgic",
  "pedantic",
  "pensive",
  "prickly",
  "reverent",
  "romantic",
  "sad",
  "serene",
  "sharp",
  "sick",
  "silly",
  "sleepy",
  "small",
  "stoic",
  "stupefied",
  "suspicious",
  "tender",
  "thirsty",
  "tiny",
  "trusting",
  "bubbly",
  "charming",
  "cheerful",
  "comical",
  "dazzling",
  "delighted",
  "dynamic",
  "effervescent",
  "enthusiastic",
  "exuberant",
  "fluffy",
  "friendly",
  "funky",
  "giddy",
  "giggly",
  "gleeful",
  "goofy",
  "graceful",
  "grinning",
  "hilarious",
  "inquisitive",
  "joyous",
  "jubilant",
  "lively",
  "mirthful",
  "mischievous",
  "optimistic",
  "peppy",
  "perky",
  "playful",
  "quirky",
  "radiant",
  "sassy",
  "silly",
  "spirited",
  "sprightly",
  "twinkly",
  "upbeat",
  "vibrant",
  "witty",
  "zany",
  "zealous",
];
/**
 * Nouns for the name of the flow
 * @constant
 *
 */
export const NOUNS: string[] = [
  "albattani",
  "allen",
  "almeida",
  "archimedes",
  "ardinghelli",
  "aryabhata",
  "austin",
  "babbage",
  "banach",
  "bardeen",
  "bartik",
  "bassi",
  "bell",
  "bhabha",
  "bhaskara",
  "blackwell",
  "bohr",
  "booth",
  "borg",
  "bose",
  "boyd",
  "brahmagupta",
  "brattain",
  "brown",
  "carson",
  "chandrasekhar",
  "colden",
  "cori",
  "cray",
  "curie",
  "darwin",
  "davinci",
  "dijkstra",
  "dubinsky",
  "easley",
  "einstein",
  "elion",
  "engelbart",
  "euclid",
  "euler",
  "fermat",
  "fermi",
  "feynman",
  "franklin",
  "galileo",
  "gates",
  "goldberg",
  "goldstine",
  "goldwasser",
  "golick",
  "goodall",
  "hamilton",
  "hawking",
  "heisenberg",
  "heyrovsky",
  "hodgkin",
  "hoover",
  "hopper",
  "hugle",
  "hypatia",
  "jang",
  "jennings",
  "jepsen",
  "joliot",
  "jones",
  "kalam",
  "kare",
  "keller",
  "khorana",
  "kilby",
  "kirch",
  "knuth",
  "kowalevski",
  "lalande",
  "lamarr",
  "leakey",
  "leavitt",
  "lichterman",
  "liskov",
  "lovelace",
  "lumiere",
  "mahavira",
  "mayer",
  "mccarthy",
  "mcclintock",
  "mclean",
  "mcnulty",
  "meitner",
  "meninsky",
  "mestorf",
  "minsky",
  "mirzakhani",
  "morse",
  "murdock",
  "newton",
  "nobel",
  "noether",
  "northcutt",
  "noyce",
  "panini",
  "pare",
  "pasteur",
  "payne",
  "perlman",
  "pike",
  "poincare",
  "poitras",
  "ptolemy",
  "raman",
  "ramanujan",
  "ride",
  "ritchie",
  "roentgen",
  "rosalind",
  "saha",
  "sammet",
  "shaw",
  "shirley",
  "shockley",
  "sinoussi",
  "snyder",
  "spence",
  "stallman",
  "stonebraker",
  "swanson",
  "swartz",
  "swirles",
  "tesla",
  "thompson",
  "torvalds",
  "turing",
  "varahamihira",
  "visvesvaraya",
  "volhard",
  "wescoff",
  "williams",
  "wilson",
  "wing",
  "wozniak",
  "wright",
  "yalow",
  "yonath",
  "coulomb",
  "degrasse",
  "dewey",
  "edison",
  "eratosthenes",
  "faraday",
  "galton",
  "gauss",
  "herschel",
  "hubble",
  "joule",
  "kaku",
  "kepler",
  "khayyam",
  "lavoisier",
  "maxwell",
  "mendel",
  "mendeleev",
  "ohm",
  "pascal",
  "planck",
  "riemann",
  "schrodinger",
  "sagan",
  "tesla",
  "tyson",
  "volta",
  "watt",
  "weber",
  "wien",
  "zoBell",
  "zuse",
  "carroll",
];

export const OPERANDS: string[] = [
"contains",
"doesNotContain",
"doesNotMatchAnyOf",
"doesNotStartWith",
"equalTo",
"greaterThan",
"isAfterDate",
"isAfterTime",
"isBeforeDate",
"isBeforeTime",
"isBlank",
"isNotBlank",
"lessThan",
"matchesAnyOf",
"notEqualTo",
"regex",
"startsWith",
];

export const OPERANDS_WITH_NO_VALUES: string[] = [
"isBlank",
"isNotBlank",
];

export const OPERANDS_WITH_MULTIPLE_ARGUMENTS: string[] = [
"matchesAnyOf",
"doesNotMatchAnyOf",
];

export const SAVE_LOAD_TALKY_FORMAT: boolean = true;

export const IMPORT_EXPORT_TALKY_FORMAT: boolean = true;

export const NODE_ENTRY_NAME: string = "entry";


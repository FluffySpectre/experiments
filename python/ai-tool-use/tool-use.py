import sys
sys.dont_write_bytecode = True

from datetime import datetime
import json

from classes.tool_list import ToolList
from classes.tools import GetAppointmentTool, GetJiraTaskTool, GetWeatherInformationTool, ConfluenceSearchTool
from classes.ai_clients import BaseAIClient, AIClientFactory

# Setup ai client
ai_client: BaseAIClient = AIClientFactory.get_client()

def prompt_llm(prompt: str, context: list, tool_list: ToolList) -> dict:
    current_time = datetime.now().isoformat()

    tools = tool_list.get_tool_outlines()
    tools_json = json.dumps({"tools": tools})

    system_prompt = {
        "role": "system",
        "content": (
            f"You are a helpful assistant.\n"
            "Take a message and find the most appropriate tools to execute, only if necessary.\n"
            "If one or more tools are used, respond as JSON using the following schema:\n"
            '{"tool_calls":[{"functionName":"function name","parameters":[{"parameterName":"name of parameter","parameterValue":"value of parameter"}]}]}\n\n'
            "If no tool is used, respond as JSON using the following schema:\n"
            '{"message":"<Your response>"}\n\n'
            f"The tools are:\n{tools_json}\n\n"
            f"The current date and time is {current_time}."
            "**IMPORTANT**: Don't complain about the tools, just use them if necessary. Don't use any other tools than the ones provided. Think step by step."
        )
    }

    response = ai_client.prompt_json(
        messages=[system_prompt, *context, {"role": "user", "content": prompt}],
    )

    # Check if the response contains tool calls
    if "tool_calls" in response:
        tool_calls = json.loads(response).get("tool_calls", [])
        tool_results = []
        for tool_call in tool_calls:
            tool = tool_list.get_tool(tool_call["functionName"])
            if tool is not None:
                result = tool.call(tool_call["parameters"])
                tool_results.append(result)
            else:
                return {"message": "The tool does not exist"}

        # Re-run the conversation with the tool results as context
        # Used XML-notation here to somewhat separate the tool results from the user input
        tool_results_str = "\n".join(tool_results)
        prompt_with_tool_results = f"<context>{tool_results_str}</context>\n\n{prompt}"
        response = ai_client.prompt_json(
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful assistant. Respond as JSON using the following schema:\n{\"message\":\"<Your response>\"}",
                },
                *context,
                {"role": "user", "content": prompt_with_tool_results}
            ],
        )

        # Add the modified prompt with tool results to the context
        context.append({"role": "user", "content": prompt_with_tool_results})
    else:
        # Add the original prompt to the context
        context.append({"role": "user", "content": prompt})
    
    return json.loads(response)

def main():
    print("Welcome to Chatbot with tools! Type '/bye' to quit.")

    # Setup available tools
    tool_list = ToolList()
    tool_list.add_tool(GetAppointmentTool())
    tool_list.add_tool(GetWeatherInformationTool())
    tool_list.add_tool(GetJiraTaskTool())
    tool_list.add_tool(ConfluenceSearchTool())

    context = []
    while True:
        prompt = input("You: ")
        if prompt == "/bye":
            break
        response = prompt_llm(prompt, context, tool_list)
        context.append({"role": "assistant", "content": json.dumps(response)})

        print(f"Context: {json.dumps(context, indent=2)}")

if __name__ == "__main__":
    main()

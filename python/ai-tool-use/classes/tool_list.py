from classes.tools import Tool

class ToolList:
    def __init__(self):
        self.tools = {}

    def add_tool(self, tool: Tool):
        self.tools[tool.get_tool_outline()["name"]] = tool

    def get_tool(self, name: str) -> Tool:
        return self.tools.get(name)

    def get_tool_outlines(self) -> list:
        return [tool.get_tool_outline() for tool in self.tools.values()]

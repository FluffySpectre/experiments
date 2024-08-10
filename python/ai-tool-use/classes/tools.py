import abc

class Tool(abc.ABC):
    @abc.abstractmethod
    def get_tool_outline(self) -> dict:
        pass

    @abc.abstractmethod
    def call(self, parameters: dict) -> str:
        pass

class GetAppointmentTool(Tool):
    def __init__(self) -> None:
        super().__init__()

        # TODO: Call an API to get the diary
        self.diary = {
            "2024-08-08T06:00:00": "Dinner from 6:00 PM to 7:00 PM"
        }

    def get_tool_outline(self) -> dict:
        return {
            "name": "get_appointment",
            "description": f"Checks calendar for a given datetime",
            "parameters": [
                {
                    "name": "datetime",
                    "description": "The datetime for the appointment in ISO-format (e.g. 2024-01-01T12:00:00)",
                    "type": "string",
                    "required": True
                }
            ]
        }

    def call(self, parameters: dict) -> str:
        datetime = parameters[0].get("parameterValue")
        if datetime in self.diary:
            return self.diary[datetime]
        return "No appointment found. So lets go!"

class GetWeatherInformationTool(Tool):
    def get_tool_outline(self) -> dict:
        return {
            "name": "get_weather_information",
            "description": "Get the weather information for a location",
            "parameters": [
                {
                    "name": "location",
                    "description": "The location for which to get the weather information (e.g. New York)",
                    "type": "string",
                    "required": True
                }
            ]
        }

    def call(self, parameters: dict) -> str:
        location = parameters[0].get("parameterValue")

        # TODO: Call an API to get the weather information
        weather = f"Weather in {location} is Sunny, 25°C"
        return weather
    
class GetJiraTaskTool(Tool):
    def get_tool_outline(self) -> dict:
        return {
            "name": "get_jira_task",
            "description": "Get a Jira task by its ID",
            "parameters": [
                {
                    "name": "taskID",
                    "description": "The ID of the task to get (e.g. PRJ-1234)",
                    "type": "string",
                    "required": True
                }
            ]
        }

    def call(self, parameters: dict) -> str:
        # TODO: Call an API to get the Jira task information
        task = "Jira Task: Task ID=PRJ-1234 - Task description=Implement new feature"
        return task

class ConfluenceSearchTool(Tool):
    def get_tool_outline(self) -> dict:
        return {
            "name": "confluence_search",
            "description": "Search for documents in Confluence",
            "parameters": [
                {
                    "name": "query",
                    "description": "The search query to use for finding documents",
                    "type": "string",
                    "required": True
                },
                {
                    "name": "space_key",
                    "description": "The key of the Confluence space to search within (optional)",
                    "type": "string",
                    "required": False
                }
            ]
        }

    def call(self, parameters: dict) -> str:
        # TODO: Call Confluence API to get the documents
        return "Pick a document from these:\n" + "\n".join(["https://your-confluence-domain.atlassian.net/wiki/spaces/TEST/pages/123456789", "https://your-confluence-domain.atlassian.net/wiki/spaces/TEST/pages/123456780"])

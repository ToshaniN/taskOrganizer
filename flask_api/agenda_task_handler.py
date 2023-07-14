from database import agendas, tasks, session
from sqlalchemy import func
from makeResponse import MakeResponse

class AgendaTaskHandler:
    def createHierarchy():
        joined = session.query(agendas, func.group_concat(tasks.id)).outerjoin(tasks, (agendas.id == tasks.task2agenda) & 
                                                                                      (tasks.status == "Active")).filter(agendas.status == "Active").group_by(agendas)
        response = []
        for agenda, taskList in joined:
            agendaToAdd = MakeResponse.createResponse(agenda)
            agendaToAdd["tasks"] = []
            if taskList is not None:
                tasksToIterate = taskList.split(",")
                for task in tasksToIterate:
                    taskToAdd = session.query(tasks).filter(tasks.id == task).first() 
                    agendaToAdd["tasks"].append(MakeResponse.createResponse(taskToAdd))
            response.append(agendaToAdd)
            print("Agenda fetched: ", agendaToAdd)
            print("")
        print("Final Hieararchy fetched: ", response)
        print("")
        return response
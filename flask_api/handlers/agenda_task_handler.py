from orm.database import agendas, tasks, session
from sqlalchemy import func
from middleware.makeResponse import MakeResponse

class AgendaTaskHandler:
    def createHierarchy():
        try:
            joined = session.query(agendas, func.group_concat(tasks.id)).outerjoin(tasks, (agendas.id == tasks.task2agenda) & 
                                                                                      (tasks.status == "Active")).filter(agendas.status == "Active").group_by(agendas).all()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            print(str(err))
            return response
        
        response = []
        for agenda, taskList in joined:
            agendaToAdd = MakeResponse.createResponse(agenda)
            agendaToAdd["tasks"] = []
            if taskList is not None:
                tasksToIterate = taskList.split(",")
                for task in tasksToIterate:
                    taskToAdd = session.query(tasks).filter(tasks.id == task).first() 
                    agendaToAdd["tasks"].append(MakeResponse.createResponse(taskToAdd))
            response.insert(0, agendaToAdd)
        toReturn = {"errCode": 0, "datarec": response}
        return toReturn
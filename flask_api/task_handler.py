from database import tasks, session
from sqlalchemy import func
from makeResponse import MakeResponse

class TaskHandler:
    def createNewTask(receivedInfo):
        newTask = tasks(task_status="Open", status="Active")
        for key in receivedInfo:
            setattr(newTask, key, receivedInfo[key])
        try:
            session.add(newTask)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 2, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(tasks.id)).first()
            justAdded = session.query(tasks).filter(tasks.id==addedId[0]).first()
            datarec = MakeResponse.createResponse(justAdded)
            response = {"errCode":0,
                        "datarec": datarec}
        return response
    

    def updateTask(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(tasks).filter(tasks.id==id).first()
        for key in receivedInfo:
            setattr(toUpdate, key, receivedInfo[key])
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            datarec = MakeResponse.createResponse(toUpdate)
            response = {"errCode":0, 
                        "datarec": datarec}
        return response

        
    def deleteTask(receivedInfo):
        id = receivedInfo["id"]
        toDelete = session.query(tasks).filter(tasks.id==id).first()
        toDelete.status = "Inactive"
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 2, "errMsg" : str(err)}
            return response
        else:
            datarec = MakeResponse.createResponse(toDelete)
            response = {"errCode":0, 
                        "datarec": datarec}
        return response
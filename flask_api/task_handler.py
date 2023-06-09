from database import tasks, session
from sqlalchemy import func

class TaskHandler:
    def createNewTask(receivedInfo):
        agenda_id = receivedInfo["task2agenda"]
        title = receivedInfo["title"]
        date = None
        priority = ""
        task_status = "Open"
        description = ""
        for key in receivedInfo:
            if key == "due_date":
                date = receivedInfo[key]
            if key == "priority":
                priority = receivedInfo[key]
            if key == "task_status":
                task_status = receivedInfo[key]
            if key == "description":
                description = receivedInfo[key]
        newTask = tasks(task2agenda=agenda_id, title=title, due_date=date, priority=priority, task_status=task_status, description=description, status="Active")
        try:
            session.add(newTask)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 2, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(tasks.id)).first()
            response = {"errCode":0,
                        "datarec": {"id": int(addedId[0]),
                                    "task2agenda": agenda_id,
                                    "title": title }}
        return response
    

    def deleteTask(receivedInfo):
        id = receivedInfo["id"]
        toDelete = session.query(tasks).filter(tasks.id==id).first()
        toDelete.status = "Inactive"
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            response = {"errCode":0, 
                        "Deleted task": {"id": id,
                                         "task2agenda": toDelete.task2agenda,
                                         "title": toDelete.title,
                                         "due_date": toDelete.due_date,
                                         "priority": toDelete.priority, 
                                         "task_status":toDelete.task_status,
                                         "description": toDelete.description  }}
        return response
from database import agendas, session
from sqlalchemy import func, exc

class AgendaHandler:
    def createNewAgenda(receivedInfo):
        agenda_name = receivedInfo["name"]
        agenda_status = "Not Started"
        if "status" in receivedInfo:
            agenda_status = receivedInfo["status"]
        newAgenda = agendas(name=agenda_name, agenda_status=agenda_status, status="Active")
        try:
            session.add(newAgenda)
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            addedId = session.query(func.max(agendas.id)).first()
            response = {"errCode":0,
                        "datarec": {"id": int(addedId[0]),
                                    "name": agenda_name, 
                                    "agenda_status":agenda_status}}
        return response
    
    def updateAgenda(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(agendas).filter(agendas.id==id).first()
        if "new_name" in receivedInfo["fields"]:
            toUpdate.name = receivedInfo["fields"]["new_name"]
        if "new_status" in receivedInfo["fields"]:
            toUpdate.agenda_status = receivedInfo["fields"]["new_status"]
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            response = {"errCode":0, 
                        "datarec": {"id": id,
                                    "name": toUpdate.name, 
                                    "agenda_status":toUpdate.agenda_status}}
        return response
    
    def deleteAgenda(receivedInfo):
        id = receivedInfo["id"]
        toDelete = session.query(agendas).filter(agendas.id==id).first()
        toDelete.status = "Inactive"
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            response = {"errCode":0, 
                        "Deleted agenda": {"id": id,
                                           "name": toDelete.name, 
                                           "agenda_status":toDelete.agenda_status}}
        return response
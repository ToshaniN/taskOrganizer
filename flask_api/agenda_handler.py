from database import agendas, session
from sqlalchemy import func, exc
# from makeResponse import MakeResponse

class AgendaHandler:
    def createNewAgenda(receivedInfo):
        # agenda_name = receivedInfo["name"]
        # agenda_status = "Not Started"
        # if "status" in receivedInfo:
        #     agenda_status = receivedInfo["status"]
        # newAgenda = agendas(name=agenda_name, agenda_status=agenda_status, status="Active")
        newAgenda = agendas(status="Active")
        for key in receivedInfo:
            setattr(newAgenda, key, receivedInfo[key])
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
                                    "name": newAgenda.name, 
                                    "agenda_status": newAgenda.agenda_status}}
        return response
    
    def updateAgenda(receivedInfo):
        id = receivedInfo["id"]
        toUpdate = session.query(agendas).filter(agendas.id==id).first()
        # if "name" in receivedInfo:
        #     toUpdate.name = receivedInfo["name"]
        # if "agenda_status" in receivedInfo:
        #     toUpdate.agenda_status = receivedInfo["agenda_status"]
        for key in receivedInfo:
            setattr(toUpdate, key, receivedInfo[key])
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            # datarec = MakeResponse.createResponse(toUpdate)
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

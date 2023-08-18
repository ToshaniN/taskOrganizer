from orm.database import agendas, session
from sqlalchemy import func
from middleware.makeResponse import MakeResponse

class AgendaHandler:
    def createNewAgenda(receivedInfo):
        newAgenda = agendas(agenda_status="Not started", status="Active")
        # set fields provided in payload
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
            # Create the response based on the agenda at the latest id
            addedId = session.query(func.max(agendas.id)).first()
            justAdded = session.query(agendas).filter(agendas.id==addedId[0]).first()
            datarec = MakeResponse.createResponse(justAdded)
            datarec['tasks'] = []
            response = {"errCode":0,
                        "datarec": datarec}
        return response
    

    def updateAgenda(receivedInfo):
        id = receivedInfo["id"]
        # Find the agenda to update and set fields according to payload
        toUpdate = session.query(agendas).filter(agendas.id==id).first()
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
                        "datarec": datarec }   
        return response
    

    def deleteAgenda(receivedInfo):
        id = receivedInfo["id"]
        # Find agenda to delete and set status as inactive
        toDelete = session.query(agendas).filter(agendas.id==id).first()
        toDelete.status = "Inactive"
        try:
            session.commit()
        except Exception as err:
            session.rollback()
            response = {"errCode" : 1, "errMsg" : str(err)}
            return response
        else:
            datarec = MakeResponse.createResponse(toDelete)
            response = {"errCode":0, 
                        "datarec": datarec}
        return response 

class MakeResponse:
    def createResponse(values):
        toReturn = {}
        for key in values.__table__.columns:
            if (key.name == "create time"):
                break
            toReturn[key.name] = getattr(values, key.name)
        return toReturn
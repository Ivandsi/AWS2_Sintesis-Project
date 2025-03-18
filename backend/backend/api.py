from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema
from typing import List

from games.models import *

api = NinjaAPI()

class GamesOut(Schema):
    id: int
    title: str
    genre: str
    
class GamesIn(Schema):
    title: str
    genre: str
    
@api.get("/games", response=List[GamesOut])
@api.get("/games/", response=List[GamesOut])
def games(request):
    games = Game.objects.all()
    return games

@api.get("/games/{game_id}", response=GamesOut)
@api.get("/games/{game_id}/", response=GamesOut)
def game(request, game_id: int):
    game = get_object_or_404(Game, id=game_id)  # Busca el joc per ID i retorna 404 si no existeix
    return game

@api.post("/games/add", response=GamesOut)
def add_game(request, payload: GamesIn):
    game = Game.objects.create(**payload.dict())
    return game

@api.put("/games/{game_id}", response=GamesOut)
@api.put("/games/{game_id}/", response=GamesOut)
def update_game(request, game_id: int, payload: GamesIn):
    game = get_object_or_404(Game, id=game_id)
    for attr, value in payload.dict().items():
        setattr(game, attr, value)
    game.save()
    return game

@api.delete("/games/{game_id}")
@api.delete("/games/{game_id}/")
def delete_game(request, game_id: int):
    game = Game.objects.filter(id=game_id).first()
    if not game:
        return {"detail": "Game not found"}
    game.delete()
    return {"detail": "Game deleted successfully"}


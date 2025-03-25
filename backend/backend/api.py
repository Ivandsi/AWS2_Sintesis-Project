from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import date
from typing import List

from games.models import *

api = NinjaAPI()

class UserProfileOut(Schema):
    user_id: int
    username: str
    profile_picture: str = None  # Return the URL for the profile picture
    bio: str = None
    location: str = None
    date_of_birth: date = None
    created_at: date
    updated_at: date

class UserProfileIn(Schema):
    profile_picture: str = None  # Accepting the file as part of the input
    bio: str = None
    location: str = None
    date_of_birth: date = None

class GamesOut(Schema):
    id: int
    title: str
    genre: str
    
class GamesIn(Schema):
    title: str
    genre: str
    
@api.get("/games", response=List[GamesOut])
def games(request):
    games = Game.objects.all()
    return games

@api.get("/games/{game_id}", response=GamesOut)
def game(request, game_id: int):
    game = get_object_or_404(Game, id=game_id)  # Busca el joc per ID i retorna 404 si no existeix
    return game

@api.post("/games/add", response=GamesOut)
def add_game(request, payload: GamesIn):
    game = Game.objects.create(**payload.dict())
    return game

@api.put("/games/{game_id}/edit", response=GamesOut)
def update_game(request, game_id: int, payload: GamesIn):
    game = get_object_or_404(Game, id=game_id)
    for attr, value in payload.dict().items():
        setattr(game, attr, value)
    game.save()
    return game

@api.delete("/games/{game_id}/delete")
def delete_game(request, game_id: int):
    game = Game.objects.filter(id=game_id).first()
    if not game:
        return {"detail": "Game not found"}
    game.delete()
    return {"detail": "Game deleted successfully"}

# Endpoint to get user profile
@api.get("/users/{user_id}", response=UserProfileOut)
def get_user_profile(request, user_id: int):
    user_profile = get_object_or_404(UserProfile, user_id=user_id)
    return user_profile

# Endpoint to update user profile (with image upload handling)
@api.put("/users/{user_id}", response=UserProfileOut)
def update_user_profile(request, user_id: int, payload: UserProfileIn):
    profile = get_object_or_404(UserProfile, user_id=user_id)
    
    # Handling file upload (if any) and saving the file path in the database
    if 'profile_picture' in request.FILES:
        profile_picture = request.FILES['profile_picture']
        file_name = default_storage.save(f"profile_pics/{profile_picture.name}", ContentFile(profile_picture.read()))
        profile.profile_picture = file_name
    
    # Update other fields
    for attr, value in payload.dict().items():
        setattr(profile, attr, value)
    
    profile.save()
    return profile
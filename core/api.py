from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema, File
from ninja.security import HttpBasicAuth, HttpBearer
from ninja.files import UploadedFile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import date, datetime
from typing import List, Optional, Union, Literal
import secrets

from .models import *

api = NinjaAPI()


# Autenticació bàsica
class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        user = authenticate(username=username, password=password)
        if user:
            # Genera un token simple
            token = secrets.token_hex(16)
            user.auth_token = token
            user.save()
            return token
        return None

# Autenticació per Token Bearer
class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            user = UserProfile.objects.get(auth_token=token)
            return user
        except UserProfile.DoesNotExist:
            return None

# Endpoint per obtenir un token
@api.get("/token", auth=BasicAuth())
@api.get("/token/", auth=BasicAuth())
def obtenir_token(request):
    return {"token": request.auth}

class LoginRequestSchema(Schema):
    username: str
    password: str
    
class UserProfileOut(Schema):
    profile_picture: Optional[str]  # Return the URL for the profile picture
    bio: Optional[str]
    location: Optional[str]
    date_of_birth: Optional[date]
    created_at: datetime
    updated_at: datetime

class UserOut(Schema):
    id: int
    username: str
    email: str
    profile: Optional[UserProfileOut] = None

class UserProfileIn(Schema):
    bio: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[date] = None
    
class UserIn(Schema):
    username: Optional[str] = None
    email: Optional[str] = None
    profile: Optional[UserProfileIn] = None

class GamesOut(Schema):
    id: int
    title: str
    release_date: date
    
class GamesIn(Schema):
    title: str
    release_date: date
    
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

# Endpoint to get user info
@api.get("/users/{user_id}", response=UserOut)
def get_user_and_profile(request, user_id: int):
    user = get_object_or_404(User, id=user_id)
    return user

# Endpoint to update user profile (with image upload handling)
@api.put("/users/{user_id}/update", response=UserOut)
def update_user_and_profile(request, user_id: int, payload: UserIn, profile_picture: UploadedFile = File(None)):
    user = get_object_or_404(User, id=user_id)

    # ✅ Update User fields if provided
    if payload.username:
        user.username = payload.username
    if payload.email:
        user.email = payload.email
    user.save()
    
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    # If the profile is provided in the payload, handle profile data
    if payload.profile:
        profile_data = payload.profile
        
        # Get or create user profile
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # Update profile fields if they are provided
        if 'bio' in profile_data:
            profile.bio = profile_data['bio']
        if 'location' in profile_data:
            profile.location = profile_data['location']
        if 'date_of_birth' in profile_data:
            profile.date_of_birth = profile_data['date_of_birth']
            
        # Handle profile picture upload (if provided)
        if profile_picture:
            # Assuming you save the uploaded file in your media directory or storage
            file_name = f"profile_pictures/{profile_picture.filename}"
            with open(file_name, "wb") as file:
                file.write(profile_picture.file.read())  # Save the image file

            # Assign the saved file path to the profile
            profile.profile_picture = file_name

        # Save profile changes
        profile.save()
    
    user = get_object_or_404(User, id=user_id)
    return user
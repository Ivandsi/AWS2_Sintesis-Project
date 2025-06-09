from django.contrib.auth import authenticate
from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema, File
from ninja.security import HttpBasicAuth, HttpBearer
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError
from ninja.files import UploadedFile
from ninja.errors import HttpError
from datetime import date, datetime
from typing import List, Optional
from ninja import Form
import secrets

from .models import *

api = NinjaAPI()


# Autenticació bàsica
class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        try:
            # Busca al usuario por email
            user = User.objects.get(email=username)
            # Verifica la contraseña
            if user.check_password(password):
                # Generate a token
                token = secrets.token_hex(16)
                
                # Get or create the UserProfile for this user
                profile, created = UserProfile.objects.get_or_create(user=user)
                
                # Assign the token to the profile
                profile.auth_token = token
                profile.save()
                return token
            return user
        except User.DoesNotExist:
            return None
        except Exception as e:
            raise HttpError(500, "Ha ocurrido un error al autenticar el usuario.")

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

class RegisterSchema(Schema):
    username: str
    email: str
    password: str
    confirmPassword: str
    
@api.post("/register/")
def register_user(request, data: RegisterSchema):
    if data.password != data.confirmPassword:
        raise HttpError(400, "Las contraseñas no coinciden.")

    try:
        user = User.objects.create(
            username=data.username,
            email=data.email,
            password=make_password(data.password)
        )
        
        UserProfile.objects.create(user=user)
        
        return {"message": "Usuario registrado exitosamente."}

    except IntegrityError:
        raise HttpError(400, "Nombre de usuario o correo ya en uso.")

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
    
# Endpoint to get user info based on token
@api.get("/users/me", response=UserOut, auth=AuthBearer())
def get_logged_in_user(request):
    user = request.auth.user  # request.auth is the UserProfile; .user gives the User object
    profile = request.auth

    # Build the profile dict, including the profile_picture URL if it exists
    profile_data = {
        "profile_picture": request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
        "bio": profile.bio,
        "location": profile.location,
        "date_of_birth": profile.date_of_birth,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile": profile_data,
    }

# Endpoint to update user profile
# This endpoint allows the user to update their profile information, including the profile picture
class ProfileUpdatePayload(Schema):
    username: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[date] = None

@api.post("/users/me/update", auth=AuthBearer())
def update_my_profile(
    request,
    payload: ProfileUpdatePayload = Form(...),
    profile_picture: Optional[UploadedFile] = File(None)
):
    user_profile = request.auth
    user = user_profile.user

    errors = {}
    updated = False

    if payload.username and payload.username != user.username:
        user.username = payload.username
        updated = True

    if payload.email and payload.email != user.email:
        # Add your email validation if needed
        user.email = payload.email
        updated = True

    if payload.bio is not None and payload.bio != user_profile.bio:
        user_profile.bio = payload.bio
        updated = True

    if payload.location is not None and payload.location != user_profile.location:
        user_profile.location = payload.location
        updated = True

    if payload.date_of_birth is not None and payload.date_of_birth != user_profile.date_of_birth:
        user_profile.date_of_birth = payload.date_of_birth
        updated = True

    if profile_picture:
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if profile_picture.content_type not in allowed_types:
            errors["profile_picture"] = "Formato de imagen inválido. Solo JPG, JPEG, PNG y WEBP."
        else:
            user_profile.profile_picture.save(profile_picture.name, profile_picture.file, save=True)
            updated = True

    if errors:
        return api.create_response(request, {"formErrors": errors}, status=400)

    if updated:
        user.save()
        user_profile.save()
        profile_data = {
            "profile_picture": request.build_absolute_uri(user_profile.profile_picture.url) if user_profile.profile_picture else None,
            "bio": user_profile.bio,
            "location": user_profile.location,
            "date_of_birth": user_profile.date_of_birth,
            "created_at": user_profile.created_at,
            "updated_at": user_profile.updated_at,
        }
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile": profile_data,
        }

    return api.create_response(request, {"type": "no_change", "detail": "No changes made."}, status=200)

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

class GamesOut(Schema):
    id: int
    title: str
    release_date: date
    
class GamesIn(Schema):
    title: str
    release_date: date

class DeveloperSchema(Schema):
    id: int
    name: str
    country: Optional[str] = None

class PublisherSchema(Schema):
    id: int
    name: str

class PlatformSchema(Schema):
    id: int
    name: str

class GenreSchema(Schema):
    id: int
    name: str

class TagSchema(Schema):
    id: int
    name: str

class FranchiseSchema(Schema):
    id: int
    name: str

# --- Game Schema ---
class GameSchema(Schema):
    id: int
    title: str
    release_date: Optional[date] = None
    developer: Optional[DeveloperSchema] = None
    publisher: Optional[PublisherSchema] = None
    platforms: List[PlatformSchema] = []
    genres: List[GenreSchema] = []
    description: str = "Sin descripción"
    cover_image_url: Optional[str] = None # Will be populated by the API
    average_rating: Optional[float] = None
    num_ratings: int = 0
    num_reviews: int = 0
    franchise: Optional[FranchiseSchema] = None
    time_played: int = 0 # hours
    multiplayer_support: bool = False
    esrb_rating: Optional[str] = None
    tags: List[TagSchema] = []

    class Config:
        from_attributes = True # Enable ORM mode for automatic mapping from Django models

class ReviewSchema(Schema):
    id: int
    user_username: str # Will be populated
    game: GameSchema
    rating: int
    review_text: Optional[str] = None
    completed_on: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
class ReviewIn(Schema):
    rating: int
    review_text: Optional[str] = None
    completed_on: Optional[date] = None

# --- GameList Schema ---
class GameListSchema(Schema):
    id: int
    name: str
    description: Optional[str] = None
    is_public: bool
    games: List[GameSchema] = []
    added_on: datetime

    class Config:
        from_attributes = True

# --- UserProfile Schema ---
class UserProfileSchema(Schema):
    username: str # From related User model
    email: str    # From related User model
    bio: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    profile_picture_url: Optional[str] = None # Will be populated by the API

    class Config:
        from_attributes = True

# --- Input Schemas for Mutations (POST/PUT/PATCH) ---
class GameListIn(Schema):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class AddRemoveGameIn(Schema):
    game_id: int
    
# --- User Profile Endpoints ---
# --- Endpoints de Perfil de Usuario (APLICACIÓN DE AUTH) ---
# Aquí es donde añadimos auth=AuthBearer() a los decoradores de los endpoints de usuario
@api.get("/user/profile/me", response=UserProfileSchema, auth=AuthBearer(), summary="Obtener el perfil del usuario actual")
def get_my_profile(request):
    # request.auth ya es el objeto UserProfile, según tu AuthBearer.authenticate
    user_profile = request.auth 
    
    profile_data = UserProfileSchema.from_orm(user_profile).dict()
    if user_profile.profile_picture:
        profile_data['profile_picture_url'] = request.build_absolute_uri(user_profile.profile_picture.url)
    else:
        profile_data['profile_picture_url'] = None
    
    # También pobla el username y email desde el user relacionado
    profile_data['username'] = user_profile.user.username
    profile_data['email'] = user_profile.user.email

    return profile_data

@api.get("/user/profile/stats", auth=AuthBearer(), summary="Obtener estadísticas de juegos del usuario actual")
def get_user_stats(request):
    # request.auth es el objeto UserProfile
    user_profile = request.auth
    user = user_profile.user # El objeto User relacionado

    played_count = GameList.objects.filter(owner=user, name="Terminado").aggregate(count=Coalesce(Count('games'), 0))['count']
    playing_count = GameList.objects.filter(owner=user, name="Jugando").aggregate(count=Coalesce(Count('games'), 0))['count']
    backlog_count = GameList.objects.filter(owner=user, name="En espera").aggregate(count=Coalesce(Count('games'), 0))['count']
    wishlist_count = GameList.objects.filter(owner=user, name="Planificado para jugar").aggregate(count=Coalesce(Count('games'), 0))['count']
    
    reviews_count = Review.objects.filter(user=user).count()
    lists_count = GameList.objects.filter(owner=user).count()

    total_time_played = Game.objects.filter(gamelist__owner=user, gamelist__name="Terminado").aggregate(total_hours=Coalesce(Sum('time_played'), 0))['total_hours']

    return {
        "played": played_count,
        "playing": playing_count,
        "reviews": reviews_count,
        "backlog": backlog_count,
        "wishlist": wishlist_count,
        "lists": lists_count,
        "total_time_played_hours": total_time_played,
    }

# --- Endpoints de Listas de Juegos del Usuario (APLICACIÓN DE AUTH) ---

@api.get("/user/my-lists", response=List[GameListSchema], auth=AuthBearer(), summary="Obtener todas las listas de juegos del usuario actual")
def get_user_lists(request):
    user_profile = request.auth
    user = user_profile.user
    
    lists = GameList.objects.filter(owner=user).prefetch_related(
        'games__developer', 'games__publisher', 'games__platforms', 
        'games__genres', 'games__tags', 'games__franchise'
    )
    
    for game_list in lists:
        for game in game_list.games.all():
            if game.cover_image:
                game.cover_image_url = request.build_absolute_uri(game.cover_image.url)
            else:
                game.cover_image_url = None
    return lists

@api.post("/user/my-lists", response=GameListSchema, auth=AuthBearer(), summary="Crear una nueva lista de juegos")
def create_game_list(request, list_in: GameListIn):
    user_profile = request.auth
    user = user_profile.user
    
    new_list = GameList.objects.create(owner=user, **list_in.dict())
    return new_list

@api.post("/user/my-lists/{list_name}/add/{game_id}", auth=AuthBearer(), summary="Añadir un juego a una lista específica")
def add_game_to_list_by_name(request, list_name: str, game_id: int):
    user_profile = request.auth
    user = user_profile.user

    # 1. Quitar el juego de cualquier lista del usuario donde ya esté
    user_lists = GameList.objects.filter(owner=user)
    for game_list in user_lists:
        if game_list.games.filter(id=game_id).exists():
            game_list.games.remove(game_id)
            # Si la lista queda vacía, elimínala
            if game_list.games.count() == 0:
                game_list.delete()
            
    # Si list_name es "null", solo eliminar de todas las listas y terminar
    if list_name == "null":
        return api.create_response(request, {"message": "Juego eliminado de todas tus listas."}, status=200)

    # 2. Buscar o crear la lista destino
    game_list, created = GameList.objects.get_or_create(
        owner=user,
        name=list_name,
        defaults={"description": "Lista de juegos", "is_public": True}
    )

    # 3. Añadir el juego a la lista destino
    game = get_object_or_404(Game, id=game_id)
    game_list.games.add(game)

    return api.create_response(request, {"message": "Juego añadido a la lista exitosamente."}, status=200)

@api.post("/user/my-lists/{list_id}/remove/{game_id}", auth=AuthBearer(), summary="Eliminar un juego de una lista específica")
def remove_game_from_list(request, list_id: int, game_id: int):
    user_profile = request.auth
    user = user_profile.user

    game_list = get_object_or_404(GameList, id=list_id, owner=user)
    game = get_object_or_404(Game, id=game_id)

    game_list.games.remove(game)

    # Si la lista queda vacía después de eliminar el juego, eliminar la lista
    if game_list.games.count() == 0:
        game_list.delete()
        return api.create_response(
            request,
            {"message": "Juego eliminado y la lista vacía fue eliminada."},
            status=200,
        )

    return api.create_response(
        request,
        {"message": "Juego eliminado de la lista exitosamente."},
        status=200,
    )

# --- Endpoints de Juegos en Tendencia (No requieren autenticación) ---
# Se mantienen sin auth=AuthBearer() para que sean accesibles públicamente
@api.get("/games/trending-games", response=List[GameSchema], summary="Obtener juegos populares/en tendencia")
def get_trending_games(request):
    trending = Game.objects.order_by('-release_date')[:8].prefetch_related(
        'developer', 'publisher', 'platforms', 'genres', 'tags', 'franchise'
    )
    for game in trending:
        if game.cover_image:
            game.cover_image_url = request.build_absolute_uri(game.cover_image.url)
        else:
            game.cover_image_url = None
    
    return trending

# --- Endpoints de Búsqueda de Juegos (No requieren autenticación) ---
# Se mantienen sin auth=AuthBearer() para que sean accesibles públicamente
@api.get("/games/search", summary="Buscar juegos por título")
def search_games(request, q: str = "", page: int = 1, per_page: int = 20):
    # Si no hay texto de búsqueda, devolver todos los juegos (limitados si es necesario)
    if not q.strip():
        games_qs = Game.objects.all().order_by("title")
    else:
        games_qs = Game.objects.filter(title__icontains=q).order_by("title")
    
    total_games = games_qs.count()
    total_pages = (total_games + per_page - 1) // per_page

    start = (page - 1) * per_page
    end = start + per_page
    games = list(games_qs[start:end])

    results = []
    for game in games:
        # Try to get the cover image URL if it exists
        if hasattr(game, "cover_image") and game.cover_image:
            cover_url = request.build_absolute_uri(game.cover_image.url)
        else:
            cover_url = None
        # Build the result dict with cover_url and release_year if available
        results.append({
            "id": game.id,
            "title": game.title,
            "release_year": getattr(game, "release_date", None).year if getattr(game, "release_date", None) else None,
            "cover_url": cover_url,
        })
    return {
        "results": results,
        "total_pages": total_pages,
        "current_page": page,
        "total_games": total_games,
        "per_page": per_page,
    }

@api.get("/games", response=List[GamesOut], summary="Obtener todos los juegos")
def games(request):
    games = Game.objects.all()
    return games

# Endpoint de detalles del juego: Cambiado a GameSchema para obtener detalles completos
@api.get("/games/{game_id}", response=GameSchema, summary="Obtener un juego por ID con detalles completos")
def game(request, game_id: int):
    # Pre-cargamos todas las relaciones OneToOne y ManyToMany para evitar N+1 queries
    game_obj = get_object_or_404(Game.objects.select_related(
        'developer', 'publisher', 'franchise'
    ).prefetch_related(
        'platforms', 'genres', 'tags', 'achievements'
    ), id=game_id)
    
    # Manually populate cover_image_url
    if game_obj.cover_image:
        game_obj.cover_image_url = request.build_absolute_uri(game_obj.cover_image.url)
    else:
        game_obj.cover_image_url = None

    return game_obj # Retornamos el objeto Game completo que se serializará con GameSchema

# Endpoint de reviews de un juego específico
@api.get("/games/{game_id}/reviews", summary="Obtener reseñas de un juego específico")
def game_reviews(request, game_id: int, page: int = 1, per_page: int = 4):
    game = get_object_or_404(Game, id=game_id)
    reviews_qs = Review.objects.filter(game=game).select_related('user').order_by('-created_at')
    total_reviews = reviews_qs.count()
    total_pages = (total_reviews + per_page - 1) // per_page

    start = (page - 1) * per_page
    end = start + per_page
    reviews = list(reviews_qs[start:end])

    # Agrega el username al objeto review
    for review in reviews:
        review.user_username = review.user.username

    # Serializa usando ReviewSchema
    reviews_data = [ReviewSchema.from_orm(r).dict() for r in reviews]
    
    return {
        "reviews": reviews_data,
        "total_pages": total_pages,
        "current_page": page,
        "total_reviews": total_reviews,
    }
    
@api.post("/games/{game_id}/reviews", response=ReviewSchema, auth=AuthBearer(), summary="Crear una reseña para un juego")
def create_review(request, game_id: int, data: ReviewIn):
    user_profile = request.auth
    user = user_profile.user

    # Solo permitir una reseña por usuario por juego
    if Review.objects.filter(user=user, game_id=game_id).exists():
        raise HttpError(400, "Ya existe una reseña para este juego por este usuario.")

    game = get_object_or_404(Game, id=game_id)
    review = Review.objects.create(
        user=user,
        game=game,
        rating=data.rating,
        review_text=data.review_text,
        completed_on=data.completed_on
    )
    review.user_username = user.username
    return review

@api.put("/games/{game_id}/reviews", response=ReviewSchema, auth=AuthBearer(), summary="Editar la reseña del usuario para un juego")
def update_review(request, game_id: int, data: ReviewIn):
    user_profile = request.auth
    user = user_profile.user

    review = Review.objects.filter(user=user, game_id=game_id).first()
    if not review:
        raise HttpError(404, "No existe una reseña para este juego por este usuario.")

    review.rating = data.rating
    review.review_text = data.review_text
    review.completed_on = data.completed_on
    review.save()
    review.user_username = user.username
    return review

# Endpoint de review del usuario actual para un juego específico
@api.get("/games/{game_id}/user-review", response=Optional[ReviewSchema], auth=AuthBearer(), summary="Obtener la reseña del usuario actual para un juego específico")
def user_game_review(request, game_id: int):
    user_profile = request.auth
    user = user_profile.user

    review = Review.objects.filter(user=user, game_id=game_id).first()
    if not review:
        return None  # <-- Esto será serializado como JSON null

    review.user_username = user.username
    return review

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

# --- Endpoints de Reseñas Populares (No requieren autenticación) ---
# Se mantienen sin auth=AuthBearer() para que sean accesibles públicamente
@api.get("/reviews/popular-reviews", response=List[ReviewSchema], summary="Obtener reseñas populares")
def get_popular_reviews(request):
    popular_reviews = Review.objects.all().order_by('-created_at')[:5].select_related('user', 'game').prefetch_related(
        'game__developer', 'game__publisher', 'game__platforms', 'game__genres', 'game__tags', 'game__franchise'
    )
    
    for review in popular_reviews:
        review.user_username = review.user.username
        if review.game.cover_image:
            review.game.cover_image_url = request.build_absolute_uri(review.game.cover_image.url)
        else:
            review.game.cover_image_url = None
    return popular_reviews

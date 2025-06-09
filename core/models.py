from django.contrib.auth.models import User
from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User

class Developer(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    country = models.CharField(max_length=100, null=True, blank=True, verbose_name="País")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Desarrollador"
        verbose_name_plural = "Desarrolladores"

class Publisher(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Distribuidora"
        verbose_name_plural = "Distribuidoras"

class Platform(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Plataforma"
        verbose_name_plural = "Plataformas"

class Genre(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Género"
        verbose_name_plural = "Generos"

class Tag(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nombre")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"

class Franchise(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Franquicia"
        verbose_name_plural = "Franquicias"

class Game(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título")
    release_date = models.DateField(null=True, blank=True, verbose_name="Fecha de lanzamiento")
    developer = models.ForeignKey(Developer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Desarrollador")
    publisher = models.ForeignKey(Publisher, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Editor")
    platforms = models.ManyToManyField(Platform, verbose_name="Plataformas")
    genres = models.ManyToManyField(Genre, verbose_name="Géneros")
    description = models.TextField(default="Sin descripción", verbose_name="Descripción")
    cover_image = models.ImageField(upload_to='game_covers/', null=True, blank=True, verbose_name="Imagen de portada")
    average_rating = models.FloatField(null=True, blank=True, verbose_name="Calificación promedio")
    num_ratings = models.IntegerField(default=0, verbose_name="Número de calificaciones")
    num_reviews = models.IntegerField(default=0, verbose_name="Número de reseñas")
    franchise = models.ForeignKey(Franchise, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Franquicia")
    time_played = models.IntegerField(default=0, verbose_name="Tiempo jugado (horas)")
    multiplayer_support = models.BooleanField(default=False, verbose_name="Soporte multijugador")
    esrb_rating = models.CharField(max_length=5, null=True, blank=True, verbose_name="Clasificación ESRB")

    tags = models.ManyToManyField(Tag, verbose_name="Etiquetas")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Juego"
        verbose_name_plural = "Juegos"
        
class Achievement(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='achievements', null=True, blank=True, verbose_name="Juego")
    title = models.CharField(max_length=255, verbose_name="Título")
    description = models.TextField(verbose_name="Descripción")

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Logro"
        verbose_name_plural = "Logros"

    
class GameList(models.Model):
    LIST_NAME_CHOICES = [
        ("Jugando", "Jugando"),
        ("Terminado", "Terminado"),
        ("En espera", "En espera"),
        ("Planificado para jugar", "Planificado para jugar"),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, default=1, verbose_name="Propietario") 
    name = models.CharField(max_length=32, choices=LIST_NAME_CHOICES, verbose_name="Nombre")
    description = models.TextField(null=True, blank=True, verbose_name="Descripción")
    is_public = models.BooleanField(default=False, verbose_name="Es público")
    games = models.ManyToManyField(Game, verbose_name="Juegos")
    added_on = models.DateTimeField(auto_now_add=True, verbose_name="Añadido el")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Lista de Juegos"
        verbose_name_plural = "Listas de Juegos"
    
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuario")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Juego")
    entry_date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de la entrada")
    entry_text = models.TextField(verbose_name="Texto de la entrada")

    def __str__(self):
        return f"Entrada de diario para {self.game.title} por {self.user.username}"
    
    class Meta:
        verbose_name = "Entrada de diario"
        verbose_name_plural = "Entradas de diario"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile", verbose_name="Usuario")
    # profile_picture = models.CharField(max_length=255, blank=True, null=True)  # Store file paths
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True, verbose_name="Foto de perfil")
    bio = models.TextField(blank=True, null=True, verbose_name="Biografía")
    location = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ubicación")
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Fecha de nacimiento")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    auth_token = models.CharField(max_length=255, unique=True, null=True, blank=True, verbose_name="Token de autenticación")

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Perfil de usuario"
        verbose_name_plural = "Perfiles de usuario"
        
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuario")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name="Juego")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], verbose_name="Calificación") # 1 to 5 stars
    review_text = models.TextField(blank=True, null=True, verbose_name="Texto de la reseña")
    completed_on = models.DateField(null=True, blank=True, verbose_name="Completado el")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    def __str__(self):
        return f"Reseña de {self.user.username} para {self.game.title}"

    class Meta:
        verbose_name = "Reseña"
        verbose_name_plural = "Reseñas"
        unique_together = ('user', 'game')
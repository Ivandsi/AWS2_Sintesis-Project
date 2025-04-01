from django.contrib.auth.models import User
from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User

class Developer(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name

class Publisher(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Platform(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Franchise(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Achievement(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title

class Game(models.Model):
    title = models.CharField(max_length=255)
    release_date = models.DateField(null=True, blank=True)
    developer = models.ForeignKey(Developer, on_delete=models.SET_NULL, null=True, blank=True)
    publisher = models.ForeignKey(Publisher, on_delete=models.SET_NULL, null=True, blank=True)
    platforms = models.ManyToManyField(Platform)
    genres = models.ManyToManyField(Genre)
    description = models.TextField(default="Sin descripción")
    cover_image = models.ImageField(upload_to='game_covers/', null=True, blank=True)
    average_rating = models.FloatField(null=True, blank=True)
    num_ratings = models.IntegerField(default=0)
    num_reviews = models.IntegerField(default=0)
    franchise = models.ForeignKey(Franchise, on_delete=models.SET_NULL, null=True, blank=True)
    time_played = models.IntegerField(default=0)  # Represented in hours
    multiplayer_support = models.BooleanField(default=False)
    esrb_rating = models.CharField(max_length=5, null=True, blank=True)  # Example: 'E', 'T', 'M'

    tags = models.ManyToManyField(Tag)
    achievements = models.ManyToManyField(Achievement, blank=True)

    def __str__(self):
        return self.title
    
class GameList(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, default=1) 
    name = models.CharField(max_length=255, default='Unnamed List')
    description = models.TextField(null=True, blank=True)
    is_public = models.BooleanField(default=False)
    games = models.ManyToManyField(Game)
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    entry_date = models.DateTimeField(auto_now_add=True)
    entry_text = models.TextField()

    def __str__(self):
        return f"Journal Entry for {self.game.title} by {self.user.username}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # profile_picture = models.CharField(max_length=255, blank=True, null=True)  # Store file path
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)  # Image field
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    auth_token = models.CharField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return self.user.username
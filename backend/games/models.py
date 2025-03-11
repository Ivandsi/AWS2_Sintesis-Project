from django.db import models

# Create your models here.

class Game(models.Model):
    title = models.CharField(max_length=200)
    genre = models.CharField(max_length=200)
    
    def __str__(self):
        return f"Game: {self.title}"
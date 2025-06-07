from django.contrib.auth.models import User
from core.models import (
    Developer, Publisher, Platform, Genre, Tag, Franchise,
    Achievement, ListInfo, Game, GameList
)
from django.utils.timezone import now
import random

# Crear usuarios
users = []
for i in range(1, 4):
    user, created = User.objects.get_or_create(username=f'usuario{i}', defaults={'password': 'password123'})
    users.append(user)

# Crear desarrolladores
developers = ["Nintendo", "Ubisoft", "Square Enix", "Rockstar Games", "Bethesda"]
dev_objects = [Developer.objects.get_or_create(name=dev)[0] for dev in developers]

# Crear publishers
publishers = ["Nintendo", "Ubisoft", "Sony", "Microsoft", "EA"]
pub_objects = [Publisher.objects.get_or_create(name=pub)[0] for pub in publishers]

# Crear plataformas
platforms = ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch"]
plat_objects = [Platform.objects.get_or_create(name=plat)[0] for plat in platforms]

# Crear géneros
genres = ["Acción", "RPG", "Aventura", "Estrategia", "Deportes"]
gen_objects = [Genre.objects.get_or_create(name=gen)[0] for gen in genres]

# Crear etiquetas
tags = ["Multijugador", "Indie", "Mundo Abierto", "Historia Profunda"]
tag_objects = [Tag.objects.get_or_create(name=tag)[0] for tag in tags]

# Crear franquicias
franchises = ["The Legend of Zelda", "Final Fantasy", "Grand Theft Auto", "The Elder Scrolls"]
fra_objects = [Franchise.objects.get_or_create(name=fran)[0] for fran in franchises]

# Crear juegos
juegos = [
    {"title": "The Legend of Zelda: Breath of the Wild", "release_date": "2017-03-03"},
    {"title": "Final Fantasy VII Remake", "release_date": "2020-04-10"},
    {"title": "Red Dead Redemption 2", "release_date": "2018-10-26"},
    {"title": "The Elder Scrolls V: Skyrim", "release_date": "2011-11-11"},
    {"title": "Cyberpunk 2077", "release_date": "2020-12-10"},
    {"title": "Hollow Knight", "release_date": "2017-02-24"},
    {"title": "The Witcher 3: Wild Hunt", "release_date": "2015-05-19"},
    {"title": "Sekiro: Shadows Die Twice", "release_date": "2019-03-22"},
    {"title": "Dark Souls III", "release_date": "2016-04-12"},
    {"title": "Elden Ring", "release_date": "2022-02-25"}
]

game_objects = []
for game in juegos:
    new_game, created = Game.objects.get_or_create(
        title=game["title"],
        defaults={
            "release_date": game["release_date"],
            "developer": random.choice(dev_objects),
            "publisher": random.choice(pub_objects),
            "description": "Juego increíble con una gran historia y jugabilidad.",
            "average_rating": round(random.uniform(7.0, 10.0), 1),
            "num_ratings": random.randint(100, 5000),
            "num_reviews": random.randint(50, 1000),
            "franchise": random.choice(fra_objects),
            "time_played": random.randint(5, 500),
            "multiplayer_support": random.choice([True, False]),
            "esrb_rating": random.choice(["E", "T", "M"])
        }
    )
    new_game.platforms.set(random.sample(plat_objects, k=2))
    new_game.genres.set(random.sample(gen_objects, k=2))
    new_game.tags.set(random.sample(tag_objects, k=2))
    game_objects.append(new_game)

# Crear listas de juegos para los usuarios
for user in users:
    for i in range(2):
        lista, created = ListInfo.objects.get_or_create(
            user=user, name=f"Lista {i+1} de {user.username}",
            defaults={"description": "Lista de juegos favoritos", "is_public": random.choice([True, False])}
        )
        for game in random.sample(game_objects, k=5):
            GameList.objects.get_or_create(game=game, list=lista)

print("Base de datos poblada correctamente.")

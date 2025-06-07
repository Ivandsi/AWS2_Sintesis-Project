from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Developer, Publisher, Platform, Genre, Tag, Franchise,
    Achievement, Game, GameList
)
import random

class Command(BaseCommand):
    help = "Populates the database with sample data"

    def handle(self, *args, **kwargs):
        
        # Delete all users except 'sinMaster'
        User.objects.exclude(username='sinMaster').delete()

        # Clear all objects in the specified models
        Developer.objects.all().delete()
        Publisher.objects.all().delete()
        Platform.objects.all().delete()
        Genre.objects.all().delete()
        Tag.objects.all().delete()
        Franchise.objects.all().delete()
        Achievement.objects.all().delete()
        Game.objects.all().delete()
        GameList.objects.all().delete()

        print("Reseteo completado: Usuarios (excepto sinMaster) y todos los modelos especificados han sido limpiados.")

        # Crear usuarios
        users = []
        for i in range(1, 4):
            user, created = User.objects.get_or_create(username=f'usuario{i}')
            if created:
                user.set_password('password123')  # Proper password hashing
                user.save()
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

        # Crear juegos y sus logros (achievements)
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

            # Add achievements to this game
            for i in range(3):  # 3 achievements per game
                Achievement.objects.create(
                    game=new_game,
                    title=f"Achievement {i+1} for {new_game.title}",
                    description=f"Descripción del logro {i+1} para {new_game.title}."
                )

            game_objects.append(new_game)

        # List names fixed
        list_names = [
            "Jugando",
            "Terminado",
            "En espera",
            "Abandonado",
            "Planificado para jugar"
        ]
        
        # Crear listas de juegos para los usuarios
        for user in users:
            used_games = set()  # Track games already added to lists for this user
            for list_name in list_names:
                lista, created = GameList.objects.get_or_create(
                    owner=user,
                    name=list_name,
                    defaults={"description": "Lista de juegos", "is_public": random.choice([True, False])}
                )

                # Get available games not in other lists
                available_games = [g for g in game_objects if g.id not in used_games]
                selected_games = random.sample(available_games, k=min(2, len(available_games)))  # 2 games per list max

                for game in selected_games:
                    lista.games.add(game)
                    used_games.add(game.id)

        self.stdout.write(self.style.SUCCESS("Base de datos poblada correctamente."))

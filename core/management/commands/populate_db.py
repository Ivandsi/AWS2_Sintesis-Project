from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Developer, Publisher, Platform, Genre, Tag, Franchise,
    Achievement, Game, GameList, Review  # Make sure Review exists
)
import random
from faker import Faker

fake = Faker('es_ES')

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
        Review.objects.all().delete()

        print("Reseteo completado: Usuarios (excepto sinMaster) y todos los modelos especificados han sido limpiados.")

        # Crear usuarios
        users = []
        for i in range(1, 21):
            username = f'usuario{i}'
            email = f'{username}@ieti.site'
            user, created = User.objects.get_or_create(username=username, defaults={'email': email})
            if created:
                user.set_password('password123')
                user.save()
            else:
                user.email = email
                user.save()
            users.append(user)

        # Crear desarrolladores
        developers = [
            "Nintendo", "Ubisoft", "Square Enix", "Rockstar Games", "Bethesda",
            "CD Projekt", "FromSoftware", "Valve", "Capcom", "Insomniac Games"
        ]
        dev_objects = [Developer.objects.get_or_create(name=dev)[0] for dev in developers]

        # Crear publishers
        publishers = [
            "Nintendo", "Ubisoft", "Sony", "Microsoft", "EA",
            "Bandai Namco", "Activision", "2K Games", "Bethesda Softworks", "SEGA"
        ]
        pub_objects = [Publisher.objects.get_or_create(name=pub)[0] for pub in publishers]

        # Plataformas (sin cambios)
        platforms = ["PC", "PlayStation 5", "Xbox Series X", "Nintendo Switch"]
        plat_objects = [Platform.objects.get_or_create(name=plat)[0] for plat in platforms]

        # Crear géneros (15 en español)
        genres = [
            "Acción", "RPG", "Aventura", "Estrategia", "Deportes",
            "Simulación", "Carreras", "Puzzle", "Terror", "Plataformas",
            "Shooter", "Lucha", "Música", "Educativo", "Sandbox"
        ]
        gen_objects = [Genre.objects.get_or_create(name=gen)[0] for gen in genres]

        # Crear etiquetas (15 en español)
        tags = [
            "Multijugador", "Indie", "Mundo Abierto", "Historia Profunda", "Cooperativo",
            "Competitivo", "Pixel Art", "Retro", "Exploración", "Ciencia Ficción",
            "Fantasía", "Sigilo", "Realista", "Casual", "Difícil"
        ]
        tag_objects = [Tag.objects.get_or_create(name=tag)[0] for tag in tags]

        # Crear franquicias (10)
        franchises = [
            "The Legend of Zelda", "Final Fantasy", "Grand Theft Auto", "The Elder Scrolls",
            "The Witcher", "Dark Souls", "Super Mario", "Assassin's Creed", "Resident Evil", "Halo"
        ]
        fra_objects = [Franchise.objects.get_or_create(name=fran)[0] for fran in franchises]

        # Crear 50 juegos
        juegos = []
        for i in range(1, 51):
            title = f"{fake.unique.word().capitalize()} {fake.word().capitalize()} {i}"
            release_date = fake.date_between(start_date='-15y', end_date='today')
            juegos.append({
                "title": title,
                "release_date": release_date
            })

        # Opcional: puedes reemplazar algunos títulos por juegos reales/franquicias conocidas

        game_objects = []
        for idx, game in enumerate(juegos):
            new_game, created = Game.objects.get_or_create(
                title=game["title"],
                defaults={
                    "release_date": game["release_date"],
                    "developer": random.choice(dev_objects),
                    "publisher": random.choice(pub_objects),
                    "description": fake.sentence(nb_words=12),
                    "average_rating": round(random.uniform(7.0, 10.0), 1),
                    "num_ratings": random.randint(100, 5000),
                    "num_reviews": random.randint(50, 1000),
                    "franchise": fra_objects[idx % len(fra_objects)],
                    "time_played": random.randint(5, 500),
                    "multiplayer_support": random.choice([True, False]),
                    "esrb_rating": random.choice(["E", "T", "M"])
                }
            )
            new_game.platforms.set(random.sample(plat_objects, k=2))
            new_game.genres.set(random.sample(gen_objects, k=2))
            new_game.tags.set(random.sample(tag_objects, k=2))

            # Add achievements to this game
            for i in range(3):
                Achievement.objects.create(
                    game=new_game,
                    title=f"Logro {i+1} para {new_game.title}",
                    description=f"Descripción del logro {i+1} para {new_game.title}."
                )

            game_objects.append(new_game)

        # List names fixed
        list_names = [
            "Jugando",
            "Terminado",
            "En espera",
            "Planificado para jugar"
        ]

        # Crear listas de juegos para los usuarios
        for user in users:
            used_games = set()
            for list_name in list_names:
                lista, created = GameList.objects.get_or_create(
                    owner=user,
                    name=list_name,
                    defaults={"description": "Lista de juegos", "is_public": random.choice([True, False])}
                )
                available_games = [g for g in game_objects if g.id not in used_games]
                selected_games = random.sample(available_games, k=min(2, len(available_games)))
                for game in selected_games:
                    lista.games.add(game)
                    used_games.add(game.id)

        # Crear 12 reviews por juego
        for game in game_objects:
            review_users = random.sample(users, k=min(12, len(users)))
            for user in review_users:
                Review.objects.create(
                    game=game,
                    user=user,
                    rating=random.randint(7, 10),
                    review_text=fake.sentence(nb_words=20),
                    completed_on=fake.date_between(start_date='-2y', end_date='today')
                )

        self.stdout.write(self.style.SUCCESS("Base de datos poblada correctamente."))

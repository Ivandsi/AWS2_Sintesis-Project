from rest_framework.routers import DefaultRouter
from games.api.urls import game_router
from django.urls import path, include

router = DefaultRouter()
#games
router.registry.extend(game_router.registry)

urlpatterns = [
    path('', include(router.urls))
    
]
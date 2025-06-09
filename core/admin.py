from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import *
    
class GameListAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_link')
    filter_horizontal = ('games',)

    def owner_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.owner.id])
        return format_html('<a href="{}">{}</a>', url, obj.owner.username)
    owner_link.short_description = 'Propietario'
    owner_link.admin_order_field = 'owner'

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        instance = form.instance

        # Ensure each game is only in one list per user
        for game in instance.games.all():
            other_lists = GameList.objects.filter(
                owner=instance.owner,
                games=game
            ).exclude(pk=instance.pk)
            for other_list in other_lists:
                other_list.games.remove(game)
                # Delete the list if it becomes empty
                if other_list.games.count() == 0:
                    other_list.delete()

        # If this list is now empty, delete it
        if instance.games.count() == 0:
            instance.delete()
    
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'game')  # assuming you added a ForeignKey to Game
    list_filter = ('game',)
    search_fields = ('title',)

class GameAdmin(admin.ModelAdmin):
    filter_horizontal = ('platforms', 'genres', 'tags')
    list_display = ('title', 'release_date', 'developer', 'publisher', 'average_rating')
    readonly_fields = ('achievements_link',)
    
    @admin.display(description="Logros")
    def achievements_link(self, obj):
        url = reverse('admin:core_achievement_changelist') + f'?game__id__exact={obj.id}'
        return format_html("<a href='{}'>Ver todos los logros de este juego &rarr;</a>", url)


# Register your models here.
admin.site.register(Developer)
admin.site.register(Publisher)
admin.site.register(Platform)
admin.site.register(Genre)
admin.site.register(Tag)
admin.site.register(Franchise)
admin.site.register(Achievement, AchievementAdmin)
admin.site.register(GameList, GameListAdmin)
admin.site.register(JournalEntry)

admin.site.register(Game, GameAdmin)
admin.site.register(UserProfile)
admin.site.register(Review)

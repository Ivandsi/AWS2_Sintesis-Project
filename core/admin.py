from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import *
    
class GameListAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_link')  # show name and custom owner column
    filter_horizontal = ('games',)
    
    def owner_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.owner.id])
        return format_html('<a href="{}">{}</a>', url, obj.owner.username)
    owner_link.short_description = 'Owner'
    owner_link.admin_order_field = 'owner'  # allow sorting by owner
    
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

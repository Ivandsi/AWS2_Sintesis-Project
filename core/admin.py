from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Developer)
admin.site.register(Publisher)
admin.site.register(Platform)
admin.site.register(Genre)
admin.site.register(Tag)
admin.site.register(Franchise)
admin.site.register(Achievement)
admin.site.register(GameList)
admin.site.register(JournalEntry)

admin.site.register(Game)
admin.site.register(UserProfile)
from django.contrib import admin
from temp_playlists.api.models import Queue, Item, Location

# Register your models here.
admin.site.register(Queue)
admin.site.register(Item)
admin.site.register(Location)

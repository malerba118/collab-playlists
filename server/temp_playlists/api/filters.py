from rest_framework import filters
from temp_playlists.api.models import Queue, Item, Location

class QueueOrderFilterBackend(filters.BaseFilterBackend):
    """
    Filter that only allows users to see their own objects.
    """
    def filter_queryset(self, request, queryset, view):
        #order by timestamp desc
        queryset = queryset.order_by("-timestamp")
        latitude = request.query_params.get('latitude', None)
        longitude = request.query_params.get('longitude', None)
        if latitude == None or longitude == None:
            return queryset
        user_position = Location(latitude=latitude, longitude=longitude)
        #filter to within 50 miles
        queues = list(filter(lambda q: q.location.distance(user_position) < 50, queryset))
        return queues

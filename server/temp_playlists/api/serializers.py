from django.contrib.auth.models import User, Group
from rest_framework import serializers
from temp_playlists.api.models import Queue, Item, Location

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')

class ItemSerializer(serializers.HyperlinkedModelSerializer):
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Item
        fields = ('id', 'track_id', 'creator')
        read_only_fields = ('creator',)


class LocationSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Location
        fields = ('latitude', 'longitude')

class QueueSerializer(serializers.HyperlinkedModelSerializer):
    selected = ItemSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    passcode = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    owner = serializers.SerializerMethodField('is_owner')
    permitted = serializers.SerializerMethodField('is_permitted')
    distance = serializers.SerializerMethodField('distance_to_user')
    location = LocationSerializer()

    def is_permitted(self, obj):
        return obj.permitted(self.context["request"].user)

    def is_owner(self, obj):
        return obj.creator == self.context["request"].user

    def distance_to_user(self, obj):
        latitude = self.context["request"].query_params.get('latitude', None)
        longitude = self.context["request"].query_params.get('longitude', None)
        if latitude != None and longitude != None:
            user_position = Location(latitude=latitude, longitude=longitude)
            return obj.location.distance(user_position)
        return -1

    def create(self, validated_data):
        loc_data = validated_data.pop('location')
        loc = Location.objects.create(**loc_data)
        return Queue.objects.create(location=loc, **validated_data)

    class Meta:
        model = Queue
        fields = ('id', 'name', 'selected', 'passcode', 'owner', 'permitted', 'location', 'distance', 'creator', 'timestamp')
        read_only_fields = ('selected',)

from django.db import models
from django.contrib.auth.models import User
import math
from geopy.distance import vincenty
# Create your models here.

class Location(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

    def distance(self, loc):
        return vincenty((self.latitude, self.longitude), (loc.latitude, loc.longitude)).miles

class Queue(models.Model):
    name = models.CharField(max_length=50)
    selected = models.ForeignKey("Item", null=True, related_name="containter", blank=True)
    creator = models.ForeignKey(User, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    passcode = models.CharField(max_length=30, null=True, blank=True)
    location = models.OneToOneField(Location)
    permissions = models.ManyToManyField(User, related_name="permitted_queues")

    def select_next(self):
        if self.empty():
            return
        if self.selected == None:
            next_index = 0
        else:
            curr_index = list(self.items()).index(self.selected)
            if curr_index < len(self.items()) - 1:
                next_index = curr_index + 1
            else:
                next_index = curr_index
        print(next_index)
        self.selected = self.items()[next_index]
        self.save()
        return self.selected

    def permitted(self, user):
        permitted = self.passcode in [None, ""] or user == self.creator or user in self.permissions.all()
        return permitted

    def empty(self):
        return len(self.items()) == 0

    def items(self):
        return Item.objects.filter(queue=self).order_by("timestamp")

    def add_item(self, track_id, creator):
        item = Item.objects.create(
            track_id=track_id,
            index=len(self.items()),
            creator=creator,
            queue=self
        )


class Item(models.Model):
    track_id = models.CharField(max_length=200)
    queue = models.ForeignKey(Queue, blank=True, null=True)
    creator = models.ForeignKey(User, blank=True, null=True)
    index = models.SmallIntegerField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

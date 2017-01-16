from django.shortcuts import render
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from temp_playlists.api.serializers import UserSerializer, GroupSerializer, QueueSerializer, ItemSerializer
from temp_playlists.api.models import Queue, Item, Location
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveDestroyAPIView, \
    RetrieveAPIView
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.http import HttpResponseForbidden
from rest_framework.filters import SearchFilter
from temp_playlists.api.filters import QueueOrderFilterBackend

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class QueueList(ListCreateAPIView):
    """
    GET: Get list of tips on a spot
    POST: Create new tip on a spot
    """
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = QueueSerializer
    filter_backends = (SearchFilter, QueueOrderFilterBackend)
    search_fields = ['name', 'creator__username']

    def get_queryset(self):
        mine =  self.request.query_params.get('mine', None)
        queues = Queue.objects.all()
        if mine == "true":
            queues = queues.filter(creator=self.request.user)
        return queues

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(
            creator=self.request.user
        )

class QueueDetail(RetrieveDestroyAPIView):
    """
    GET: Get list of tips on a spot
    POST: Create new tip on a spot
    """
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = QueueSerializer

    def get_queryset(self):
        return Queue.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_destroy(self, instance):
        pk = self.kwargs.get('pk', None)
        queue = get_object_or_404(Queue, pk=pk)
        if self.request.user != queue.creator:
            return HttpResponseForbidden()
        queue.delete()

class QueueItemDetail(RetrieveDestroyAPIView):
    """
    GET: Get list of tips on a spot
    POST: Create new tip on a spot
    """
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = ItemSerializer

    def get_queryset(self):
        return Queue.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_destroy(self, instance):
        pk = self.kwargs.get('pk', None)
        queue = get_object_or_404(Queue, pk=pk)
        item_pk = self.kwargs.get('item_pk', None)
        item = get_object_or_404(Item, pk=item_pk)
        if self.request.user != queue.creator:
            return HttpResponseForbidden()
        if queue.selected == item:
            queue.selected = None
            queue.save()
        item.delete()

class QueueItemList(ListCreateAPIView):
    """
    GET: Get list of tips on a spot
    POST: Create new tip on a spot
    """
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = ItemSerializer

    def get_queryset(self):
        pk = self.kwargs.get('pk', None)
        queue = get_object_or_404(Queue, pk=pk)
        items = Item.objects.filter(queue=queue)
        return items

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        pk = self.kwargs.get('pk', None)
        queue = get_object_or_404(Queue, pk=pk)
        if not queue.permitted(self.request.user):
            return HttpResponseForbidden()
        item = serializer.save(
            queue=queue,
            creator=self.request.user,
            index=len(queue.items())
        )
        if queue.selected == None:
            queue.selected = item
        queue.save()

class QueueNext(APIView):

    def post(self, request, pk, format=None):
        queue = get_object_or_404(Queue, pk=pk)
        if queue.creator != request.user:
            return HttpResponseForbidden()
        item_id = request.data.get("item_id", None)
        if item_id != None:
            #select specified item
            item = get_object_or_404(Item, queue=queue, id=item_id)
            queue.selected = item
            queue.save()
            selected = item
        else:
            #select next item
            selected = queue.select_next()
        serializer = ItemSerializer(selected, context={'request': request})
        return Response(serializer.data)


class QueuePermissions(APIView):

    def post(self, request, pk, format=None):
        queue = get_object_or_404(Queue, pk=pk)
        passcode = request.data.get("passcode", None)
        if passcode == queue.passcode:
            if request.user not in queue.permissions.all():
                queue.permissions.add(request.user)
                queue.save()
        else:
            return HttpResponseForbidden()
        serializer = QueueSerializer(queue, context={'request': request})
        return Response(serializer.data)

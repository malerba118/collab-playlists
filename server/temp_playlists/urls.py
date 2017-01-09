"""temp_playlists URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls import url, include
from rest_framework import routers
from temp_playlists.api import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^api/admin/', include(admin.site.urls)),
    url(r'^api/auth/', include('rest_framework_social_oauth2.urls')),
    url(r'^api/', include(router.urls)),
    url(r'^api/queues/(?P<pk>[0-9]+)/permissions/', views.QueuePermissions.as_view(), name="queue-permission"),
    url(r'^api/queues/(?P<pk>[0-9]+)/items/', views.QueueItemList.as_view(), name="queue-item-list"),
    url(r'^api/queues/(?P<pk>[0-9]+)/select-next/', views.QueueNext.as_view(), name="queue-next"),
    url(r'^api/queues/(?P<pk>[0-9]+)/', views.QueueDetail.as_view(), name="queue-detail"),
    url(r'^api/queues/', views.QueueList.as_view(), name="queue-list"),
    url(r'^api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

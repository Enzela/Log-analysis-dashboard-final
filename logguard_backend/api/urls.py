from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogFileViewSet, AlertViewSet, RegisterViewSet

router = DefaultRouter()
router.register(r'logs', LogFileViewSet, basename='logs')
router.register(r'alerts', AlertViewSet, basename='alerts')
router.register(r'register', RegisterViewSet, basename='register')

urlpatterns = [
    path('', include(router.urls)),
]
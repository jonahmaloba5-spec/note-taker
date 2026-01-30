from django.urls import path
from . import views

urlpatterns = [
    path("available-notes", views.available_notes),
    path("create-note", views.create_note),
    path("<int:note_id>/delete", views.delete_note),
]
